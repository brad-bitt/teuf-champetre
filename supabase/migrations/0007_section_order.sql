-- ============================================================
-- Teuf Champêtre — ordre des sections de la page
-- À exécuter dans le SQL Editor du dashboard Supabase.
-- ============================================================

-- Ordre des sections (clés séparées par des virgules), réordonnables depuis
-- le site en mode admin (flèches ↑↓). Défaut : infos pratiques avant les photos.
alter table public.settings
  add column if not exists section_order text not null default 'lineup,activities,infos,gallery';
