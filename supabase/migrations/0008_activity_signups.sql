-- ============================================================
-- Teuf Champêtre — inscriptions aux activités via un pseudo
-- À exécuter dans le SQL Editor Supabase.
-- ============================================================

create table public.activity_signups (
  id          uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  pseudo      text not null check (char_length(trim(pseudo)) between 1 and 30),
  created_at  timestamptz not null default now()
);

-- Un même pseudo ne peut s'inscrire qu'une fois par activité
-- (insensible à la casse et aux espaces autour)
create unique index activity_signups_unique_pseudo
  on public.activity_signups (activity_id, lower(trim(pseudo)));

alter table public.activity_signups enable row level security;

-- Site entre copains : tout le monde peut lire, s'inscrire et se désinscrire.
-- Les garde-fous (pseudo 1–30 caractères, unicité) sont assurés ci-dessus.
create policy "lecture publique" on public.activity_signups for select using (true);
create policy "inscription publique" on public.activity_signups for insert with check (true);
create policy "désinscription publique" on public.activity_signups for delete using (true);
