-- ============================================================
-- Teuf Champêtre — infos pratiques + compte à rebours
-- À exécuter dans le SQL Editor du dashboard Supabase.
-- ============================================================

-- Début de l'événement : alimente le compte à rebours du hero.
-- Nullable : tant que ce n'est pas renseigné, pas de compte à rebours.
alter table public.settings add column if not exists event_start timestamptz;

-- Section « Infos pratiques » (accès, camping, à apporter…)
create table public.infos (
  id         uuid primary key default gen_random_uuid(),
  emoji      text not null default '📌',
  title      text not null,
  body       text not null default '',
  position   int  not null default 0,
  created_at timestamptz not null default now()
);

alter table public.infos enable row level security;

create policy "lecture publique" on public.infos for select using (true);
create policy "écriture admin" on public.infos for all
  using (public.is_admin()) with check (public.is_admin());

-- Quelques cartes de départ (modifiables/supprimables depuis le back-office)
insert into public.infos (emoji, title, body, position) values
  ('🚗', 'Accès',      'À 45 min de la ville, parking dans le pré d''à côté. Covoiturage fortement encouragé — le peloton roule groupé !', 0),
  ('⛺', 'Camping',    'Plante ta tente où tu veux dans le champ du haut. Réveil au chant du coq garanti, café offert aux lève-tôt.', 1),
  ('🎒', 'À apporter', 'Gourde, crème solaire, lampe frontale et ta plus belle tenue de cycliste. Laisse le verre à la maison.', 2);
