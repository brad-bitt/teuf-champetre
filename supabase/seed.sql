-- ============================================================
-- Teuf Champêtre — données initiales
-- À exécuter APRÈS 0001_init.sql, dans le SQL Editor Supabase.
-- ============================================================

-- Infos du site
insert into public.settings (id) values (1)
on conflict (id) do nothing;

-- Line-up d'attente (le même que la maquette — remplace-le via le back-office)
insert into public.artists (name, genre, slot, position) values
  ('Bétonnière Sonore', 'Électro', 'Samedi · 23h30', 0),
  ('Les Fourches',      'Rock',    'Samedi · 21h00', 1),
  ('DJ Paille',         'Techno',  'Dimanche · 01h00', 2),
  ('Mirabelle Club',    'Pop',     'Samedi · 19h00', 3),
  ('Tracteur Rave',     'Électro', 'Dimanche · 23h00', 4),
  ('Foin Fatal',        'Rock',    'Dimanche · 20h30', 5);

-- Activités d'attente (remplace-les via le back-office)
insert into public.activities (name, slot, place, position) values
  ('Bingo champêtre',     'Samedi · 15h00',   'Sous le chapiteau',  0),
  ('Loto des champs',     'Samedi · 17h00',   'La grange',          1),
  ('Tournoi de pétanque', 'Dimanche · 11h00', 'Terrain du haut',    2),
  ('Chasse au trésor',    'Dimanche · 14h00', 'Tout le champ',      3);

-- ⚠️ IMPORTANT : déclare ton/tes email(s) admin ici.
-- C'est l'email du compte Google (ou du compte email/mot de passe créé
-- dans Authentication → Users) qui doit apparaître dans cette table.
-- Exemple :
-- insert into public.admins (email) values ('ton-email@gmail.com');
