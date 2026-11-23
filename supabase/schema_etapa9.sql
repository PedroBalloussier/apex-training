-- Apex — técnicas de série: técnica, blocos (quedas, pausas, mini-séries) e detalhe (cadência).
-- Pode ser executado de novo sem erro. Séries antigas ficam como 'normal' (ou 'failure' se marcadas como falha).
alter table public.workout_sets add column if not exists technique text not null default 'normal';
alter table public.workout_sets add column if not exists blocks jsonb;
alter table public.workout_sets add column if not exists technique_detail text;
alter table public.workout_sets drop constraint if exists workout_sets_technique_check;
alter table public.workout_sets add constraint workout_sets_technique_check
  check (technique in ('normal', 'warmup', 'failure', 'drop', 'rest_pause', 'myo', 'partials', 'amrap', 'tempo'));
alter table public.workout_sets drop constraint if exists workout_sets_blocks_check;
alter table public.workout_sets add constraint workout_sets_blocks_check
  check (blocks is null or (jsonb_typeof(blocks) = 'array' and jsonb_array_length(blocks) <= 10));
alter table public.workout_sets drop constraint if exists workout_sets_technique_detail_check;
alter table public.workout_sets add constraint workout_sets_technique_detail_check
  check (technique_detail is null or char_length(technique_detail) <= 20);
update public.workout_sets set technique = 'failure' where to_failure and technique = 'normal';
