-- ============================================================
-- Teuf Champêtre — ordre des photos (drag & drop du back-office)
-- À exécuter dans le SQL Editor Supabase si le projet a été créé
-- AVANT ce changement (sinon déjà inclus dans 0001_init.sql).
-- ============================================================

alter table public.photos
  add column if not exists position int not null default 0;

-- Reprend l'ordre actuel (date d'upload) comme point de départ
update public.photos p
set position = sub.rn - 1
from (
  select id, row_number() over (order by created_at) as rn
  from public.photos
) sub
where p.id = sub.id;
