-- ============================================================
-- Teuf Champêtre — activités (bingo, loto, pétanque…)
-- À exécuter dans le SQL Editor Supabase si le projet a été créé
-- AVANT ce changement (sinon déjà inclus dans 0001_init.sql).
-- ============================================================

create table public.activities (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slot       text not null default 'Horaire à venir',
  place      text not null default '',
  position   int  not null default 0,
  created_at timestamptz not null default now()
);

alter table public.activities enable row level security;

create policy "lecture publique" on public.activities for select using (true);
create policy "écriture admin" on public.activities for all
  using (public.is_admin()) with check (public.is_admin());
