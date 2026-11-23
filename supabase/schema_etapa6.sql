-- Apex — etapa 6: desafios do Hall da Fama. Pode ser executado de novo sem erro.

create table if not exists public.challenge_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  challenge_id text not null,
  week_start date not null,
  status text not null default 'done' check (status in ('done')),
  workout_id uuid references public.workouts (id) on delete set null,
  completed_at timestamptz not null default now(),
  unique (user_id, challenge_id, week_start)
);

create index if not exists challenge_runs_user_idx on public.challenge_runs (user_id, completed_at desc);

alter table public.challenge_runs enable row level security;

drop policy if exists "challenge_runs_own" on public.challenge_runs;
create policy "challenge_runs_own" on public.challenge_runs
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.challenge_runs to authenticated;
