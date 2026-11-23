-- Apex — etapa 3: treinos e séries. Pode ser executado de novo sem erro.

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  plan_id uuid references public.plans (id) on delete set null,
  day_key text not null,
  day_type text not null,
  status text not null default 'in_progress' check (status in ('in_progress', 'done')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_sec int,
  exercises jsonb not null default '[]'::jsonb,   -- exercícios desta sessão (com trocas feitas só no treino)
  created_at timestamptz not null default now()
);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  workout_id uuid not null references public.workouts (id) on delete cascade,
  exercise_id text not null,
  position int not null,
  set_number int not null,
  reps int check (reps between 0 and 500),
  weight_kg numeric(6,2) check (weight_kg between 0 and 1000),
  to_failure boolean not null default false,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  unique (workout_id, position, set_number)
);

create index if not exists workouts_user_idx on public.workouts (user_id, started_at desc);
create unique index if not exists workouts_one_open on public.workouts (user_id) where status = 'in_progress';
create index if not exists sets_user_ex_idx on public.workout_sets (user_id, exercise_id, created_at desc);
create index if not exists sets_workout_idx on public.workout_sets (workout_id);

alter table public.workouts enable row level security;
alter table public.workout_sets enable row level security;

drop policy if exists "workouts_own" on public.workouts;
create policy "workouts_own" on public.workouts
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "sets_own" on public.workout_sets;
create policy "sets_own" on public.workout_sets
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.workouts, public.workout_sets to authenticated;
