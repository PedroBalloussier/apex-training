-- Apex — etapa 5: medidas corporais. Pode ser executado de novo sem erro.

create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  measured_on date not null default current_date,
  weight_kg numeric(5,1) check (weight_kg between 30 and 300),
  body_fat_pct numeric(4,1) check (body_fat_pct between 3 and 60),
  waist_cm numeric(5,1) check (waist_cm between 40 and 200),
  chest_cm numeric(5,1) check (chest_cm between 50 and 200),
  arm_cm numeric(5,1) check (arm_cm between 15 and 70),
  thigh_cm numeric(5,1) check (thigh_cm between 30 and 100),
  hip_cm numeric(5,1) check (hip_cm between 50 and 200),
  created_at timestamptz not null default now(),
  unique (user_id, measured_on)
);

create index if not exists body_user_idx on public.body_measurements (user_id, measured_on desc);

alter table public.body_measurements enable row level security;

drop policy if exists "body_own" on public.body_measurements;
create policy "body_own" on public.body_measurements
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.body_measurements to authenticated;
