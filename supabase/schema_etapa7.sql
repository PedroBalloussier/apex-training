-- Apex — etapa 7: Party (competição entre amigos). Pode ser executado de novo sem erro.
-- Regra de privacidade: membros de uma party veem o nome, os pontos e os eventos da party.
-- Nada de treinos, cargas ou medidas: esses continuam visíveis só para o dono.

create table if not exists public.parties (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null check (char_length(name) between 2 and 40),
  format text not null check (format in ('hall', 'consistency', 'duel')),
  period text not null check (period in ('weekly', 'monthly')),
  categories text[] not null default '{}',
  hall_bonus boolean not null default true,
  challenge_id text,
  season int not null default 1,
  season_start date not null default current_date,
  season_end date not null,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.party_members (
  party_id uuid not null references public.parties (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 30),
  days_per_week int not null default 3 check (days_per_week between 1 and 7),
  joined_at timestamptz not null default now(),
  primary key (party_id, user_id)
);

create table if not exists public.party_events (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.parties (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('workout', 'challenge', 'record', 'streak', 'join')),
  ref text not null default '',
  points int not null default 0,
  day date not null default current_date,
  created_at timestamptz not null default now(),
  unique (party_id, user_id, kind, ref)
);

create index if not exists party_members_user_idx on public.party_members (user_id);
create index if not exists party_events_party_idx on public.party_events (party_id, day desc);

-- Membro da party? (security definer evita recursão nas políticas)
create or replace function public.is_party_member(p_party uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from party_members where party_id = p_party and user_id = auth.uid());
$$;

alter table public.parties enable row level security;
alter table public.party_members enable row level security;
alter table public.party_events enable row level security;

drop policy if exists "parties_member_read" on public.parties;
create policy "parties_member_read" on public.parties for select to authenticated
  using (public.is_party_member(id));
drop policy if exists "parties_owner_update" on public.parties;
create policy "parties_owner_update" on public.parties for update to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
drop policy if exists "parties_owner_delete" on public.parties;
create policy "parties_owner_delete" on public.parties for delete to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "members_member_read" on public.party_members;
create policy "members_member_read" on public.party_members for select to authenticated
  using (public.is_party_member(party_id));
drop policy if exists "members_self_update" on public.party_members;
create policy "members_self_update" on public.party_members for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "members_leave_or_kick" on public.party_members;
create policy "members_leave_or_kick" on public.party_members for delete to authenticated
  using ((select auth.uid()) = user_id
         or exists (select 1 from public.parties p where p.id = party_id and p.owner_id = (select auth.uid())));

drop policy if exists "events_member_read" on public.party_events;
create policy "events_member_read" on public.party_events for select to authenticated
  using (public.is_party_member(party_id));

grant select, update, delete on public.parties to authenticated;
grant select, update, delete on public.party_members to authenticated;
grant select on public.party_events to authenticated;

-- Fim da temporada a partir do início
create or replace function public.party_season_end(p_period text, p_start date)
returns date language sql immutable as $$
  select case when p_period = 'weekly' then p_start + 6 else (p_start + interval '1 month' - interval '1 day')::date end;
$$;

-- Criar party (o criador entra como primeiro membro)
create or replace function public.party_create(
  p_name text, p_format text, p_period text, p_categories text[], p_hall_bonus boolean,
  p_challenge text, p_display_name text, p_days int)
returns public.parties language plpgsql security definer set search_path = public as $$
declare
  v_code text;
  v_row parties;
  v_alpha text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  loop
    v_code := '';
    for i in 1..6 loop v_code := v_code || substr(v_alpha, 1 + floor(random() * length(v_alpha))::int, 1); end loop;
    exit when not exists (select 1 from parties where code = v_code);
  end loop;
  insert into parties (code, name, format, period, categories, hall_bonus, challenge_id, season_start, season_end, owner_id)
  values (v_code, trim(p_name), p_format, p_period, coalesce(p_categories, '{}'), coalesce(p_hall_bonus, true),
          p_challenge, current_date, party_season_end(p_period, current_date), auth.uid())
  returning * into v_row;
  insert into party_members (party_id, user_id, display_name, days_per_week)
  values (v_row.id, auth.uid(), left(trim(p_display_name), 30), greatest(1, least(7, coalesce(p_days, 3))));
  insert into party_events (party_id, user_id, kind, ref, points) values (v_row.id, auth.uid(), 'join', '', 0);
  return v_row;
end $$;

-- Entrar com o código do convite
create or replace function public.party_join(p_code text, p_display_name text, p_days int)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_party parties;
  v_count int;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  select * into v_party from parties where code = upper(trim(p_code));
  if not found then raise exception 'party_not_found'; end if;
  if exists (select 1 from party_members where party_id = v_party.id and user_id = auth.uid()) then return v_party.id; end if;
  select count(*) into v_count from party_members where party_id = v_party.id;
  if v_count >= (case when v_party.format = 'duel' then 2 else 20 end) then raise exception 'party_full'; end if;
  insert into party_members (party_id, user_id, display_name, days_per_week)
  values (v_party.id, auth.uid(), left(trim(p_display_name), 30), greatest(1, least(7, coalesce(p_days, 3))));
  insert into party_events (party_id, user_id, kind, ref, points) values (v_party.id, auth.uid(), 'join', v_party.season::text, 0)
  on conflict do nothing;
  return v_party.id;
end $$;

-- Registrar pontos em todas as parties ativas do usuário.
-- Os pontos são definidos aqui, no servidor, com limite diário de 50 por party.
create or replace function public.party_log(p_kind text, p_ref text)
returns int language plpgsql security definer set search_path = public as $$
declare
  v_party parties;
  v_base int;
  v_pts int;
  v_today int;
  v_total int := 0;
  v_cap constant int := 50;
begin
  if auth.uid() is null then return 0; end if;
  v_base := case p_kind when 'workout' then 10 when 'challenge' then 25 when 'record' then 5 when 'streak' then 15 else 0 end;
  if v_base = 0 then return 0; end if;
  for v_party in
    select p.* from parties p join party_members m on m.party_id = p.id
    where m.user_id = auth.uid() and current_date between p.season_start and p.season_end
  loop
    v_pts := v_base;
    if p_kind = 'challenge' then
      if v_party.format = 'hall' then
        if v_party.challenge_id is not null and v_party.challenge_id <> split_part(p_ref, ':', 1) then v_pts := 0; end if;
      elsif not v_party.hall_bonus then
        v_pts := 0;
      end if;
    end if;
    continue when v_pts = 0;
    select coalesce(sum(points), 0) into v_today from party_events
      where party_id = v_party.id and user_id = auth.uid() and day = current_date;
    v_pts := least(v_pts, v_cap - v_today);
    continue when v_pts <= 0;
    insert into party_events (party_id, user_id, kind, ref, points, day)
    values (v_party.id, auth.uid(), p_kind, left(coalesce(p_ref, ''), 80), v_pts, current_date)
    on conflict do nothing;
    if found then v_total := v_total + v_pts; end if;
  end loop;
  return v_total;
end $$;

-- Nova temporada (só o criador). No formato Hall da Fama, define o novo desafio comum.
create or replace function public.party_new_season(p_party uuid, p_challenge text)
returns public.parties language plpgsql security definer set search_path = public as $$
declare v_row parties;
begin
  update parties set season = season + 1, season_start = current_date,
    season_end = party_season_end(period, current_date),
    challenge_id = coalesce(p_challenge, challenge_id)
  where id = p_party and owner_id = auth.uid()
  returning * into v_row;
  if not found then raise exception 'not_owner'; end if;
  return v_row;
end $$;

revoke all on function public.party_create(text, text, text, text[], boolean, text, text, int) from public, anon;
revoke all on function public.party_join(text, text, int) from public, anon;
revoke all on function public.party_log(text, text) from public, anon;
revoke all on function public.party_new_season(uuid, text) from public, anon;
grant execute on function public.party_create(text, text, text, text[], boolean, text, text, int) to authenticated;
grant execute on function public.party_join(text, text, int) to authenticated;
grant execute on function public.party_log(text, text) to authenticated;
grant execute on function public.party_new_season(uuid, text) to authenticated;
grant execute on function public.is_party_member(uuid) to authenticated;
