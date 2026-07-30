-- ============================================================
-- Teuf Champêtre — gestion des admins depuis le back-office
-- À exécuter dans le SQL Editor Supabase si le projet a été créé
-- AVANT ce changement (sinon déjà inclus dans 0001_init.sql).
-- ============================================================

create policy "ajout admin" on public.admins for insert with check (public.is_admin());
create policy "suppression admin" on public.admins for delete
  using (public.is_admin() and (select count(*) from public.admins) > 1);
