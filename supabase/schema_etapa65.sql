-- Apex — etapa 6.5: medida do pescoço (estimativa de % de gordura). Pode ser executado de novo sem erro.
alter table public.body_measurements add column if not exists neck_cm numeric(4,1);
alter table public.body_measurements drop constraint if exists body_measurements_neck_cm_check;
alter table public.body_measurements add constraint body_measurements_neck_cm_check check (neck_cm between 20 and 70);
