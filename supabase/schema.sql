-- Apex — esquema do banco (etapa 2)
-- Executar no SQL Editor do Supabase. Pode ser executado de novo sem erro.

-- Perfis (1 por usuário, criado automaticamente no cadastro)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  birth_date date,
  sex text check (sex in ('male', 'female', 'other')),
  height_cm numeric(5,1) check (height_cm between 100 and 250),
  weight_kg numeric(5,1) check (weight_kg between 30 and 300),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Triagens (histórico: uma nova a cada ciclo ou troca de treino)
create table if not exists public.triages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

-- Planos (um ativo por vez; os anteriores ficam arquivados)
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  triage_id uuid references public.triages (id) on delete set null,
  name text not null,
  split text not null,
  goal text not null,
  cycle_weeks int not null default 12 check (cycle_weeks in (8, 12)),
  data jsonb not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists triages_user_idx on public.triages (user_id, created_at desc);
create index if not exists plans_user_idx on public.plans (user_id, created_at desc);
create unique index if not exists plans_one_active on public.plans (user_id) where status = 'active';

-- Regras de acesso: cada pessoa só vê e altera os próprios dados
alter table public.profiles enable row level security;
alter table public.triages enable row level security;
alter table public.plans enable row level security;

drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "triages_own" on public.triages;
create policy "triages_own" on public.triages
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "plans_own" on public.plans;
create policy "plans_own" on public.plans
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.profiles, public.triages, public.plans to authenticated;

-- updated_at automático
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Cria o perfil quando alguém se cadastra
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Ativar um plano arquiva o anterior, numa única operação
create or replace function public.activate_plan(p_plan jsonb, p_triage uuid)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare new_id uuid;
begin
  update public.plans set status = 'archived', ended_at = now()
    where user_id = auth.uid() and status = 'active';
  insert into public.plans (triage_id, name, split, goal, cycle_weeks, data)
    values (p_triage, p_plan ->> 'name', p_plan ->> 'split', p_plan ->> 'goal',
            coalesce((p_plan ->> 'cycleWeeks')::int, 12), p_plan)
    returning id into new_id;
  return new_id;
end $$;

revoke execute on function public.activate_plan(jsonb, uuid) from public, anon;
grant execute on function public.activate_plan(jsonb, uuid) to authenticated;
