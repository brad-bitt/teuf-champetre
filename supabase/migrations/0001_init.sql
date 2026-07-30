-- ============================================================
-- Teuf Champêtre — schéma initial
-- À exécuter dans le SQL Editor du dashboard Supabase
-- (ou via `supabase db push` si tu utilises la CLI).
-- ============================================================

-- ---------- Tables ----------

-- Infos générales du site (une seule ligne, id = 1)
create table public.settings (
  id              int primary key default 1 check (id = 1),
  edition         text not null default 'Édition 2026',
  dates           text not null default '22–23 août',
  lieu            text not null default 'Le grand champ, quelque part en campagne',
  billetterie_url text not null default '#billetterie-bientot',
  updated_at      timestamptz not null default now()
);

-- Programmation
create table public.artists (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  genre      text not null default 'Mystère',
  slot       text not null default 'Horaire à venir',
  spotify    text,
  soundcloud text,
  instagram  text,
  position   int  not null default 0,
  created_at timestamptz not null default now()
);

-- Galerie (les fichiers image vivent chez Cloudinary, on ne garde ici que leur identifiant)
create table public.photos (
  id         uuid primary key default gen_random_uuid(),
  public_id  text not null,
  label      text not null default '',
  created_at timestamptz not null default now()
);

-- Liste blanche des admins : seuls ces emails peuvent modifier le contenu.
-- N'importe qui peut se connecter avec Google, mais sans une ligne ici,
-- le compte n'a aucun droit d'écriture.
create table public.admins (
  email text primary key
);

-- ---------- Fonction utilitaire ----------

-- L'utilisateur connecté est-il admin ? (utilisée par les politiques RLS et le front)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------- Row Level Security ----------

alter table public.settings enable row level security;
alter table public.artists  enable row level security;
alter table public.photos   enable row level security;
alter table public.admins   enable row level security;

-- Lecture publique du contenu du site
create policy "lecture publique" on public.settings for select using (true);
create policy "lecture publique" on public.artists  for select using (true);
create policy "lecture publique" on public.photos   for select using (true);

-- Écriture réservée aux admins
create policy "écriture admin" on public.settings for all
  using (public.is_admin()) with check (public.is_admin());
create policy "écriture admin" on public.artists for all
  using (public.is_admin()) with check (public.is_admin());
create policy "écriture admin" on public.photos for all
  using (public.is_admin()) with check (public.is_admin());

-- La liste des admins n'est lisible/modifiable que par un admin (depuis le
-- back-office du site). Suppression bloquée s'il ne reste qu'un seul admin,
-- pour ne jamais se retrouver sans accès.
create policy "lecture admin" on public.admins for select using (public.is_admin());
create policy "ajout admin" on public.admins for insert with check (public.is_admin());
create policy "suppression admin" on public.admins for delete
  using (public.is_admin() and (select count(*) from public.admins) > 1);
