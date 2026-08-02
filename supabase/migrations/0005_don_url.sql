-- ============================================================
-- Bouton « Faire un don » (HelloAsso)
-- URL éditable dans le back-office (modale ⚙️ Infos du site).
-- Vide ⇒ le bouton n'apparaît pas sur le site.
-- ============================================================

alter table public.settings
  add column if not exists don_url text not null default '';

-- Pré-remplit le lien actuel de la cagnotte (modifiable ensuite via le back-office)
update public.settings
  set don_url = 'https://www.helloasso.com/associations/le-bouquet/formulaires/1'
  where id = 1 and don_url = '';
