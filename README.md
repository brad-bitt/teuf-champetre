# 🚴 Teuf Champêtre — Site du festival

Site néo-brutaliste du festival **Teuf Champêtre** (thème vélo / Tour de France), avec un
back-office intégré pour gérer la programmation, la galerie photos et les infos du site.

Implémenté depuis la maquette Claude Design archivée dans [`design/`](design/).

## Stack

- **[Next.js](https://nextjs.org)** (App Router) + **TypeScript** + CSS Modules
- **[Supabase](https://supabase.com)** : base de données (programmation, infos), Storage
  (photos) et authentification (email/mot de passe + Google)
- Déployable sur **Vercel** en un clic

## Comment ça marche

- **Site public** : hero + billetterie, programmation (avec liens Spotify / SoundCloud /
  Instagram par artiste), galerie photos, footer.
- **Back-office** : pas de page d'admin séparée — clique sur le bouton discret **« Admin »**
  tout en bas du footer. Une modale de connexion s'ouvre (Google ou email/mot de passe).
  Une fois connecté·e, les contrôles d'édition apparaissent directement sur le site :
  ajout/suppression d'artistes et de photos, édition des liens et des infos (dates, lieu,
  édition, URL billetterie).
- **Sécurité** : n'importe qui peut se connecter avec Google, mais seuls les emails listés
  dans la table `admins` ont le droit de modifier quoi que ce soit (politiques RLS côté
  Supabase — le front ne fait que refléter ces droits).
- **Mode démo** : tant que Supabase n'est pas configuré, le site affiche les données
  d'exemple et le back-office est désactivé.

## Démarrer en local

```bash
npm install
npm run dev          # → http://localhost:3000 (mode démo sans .env.local)
```

## Configurer Supabase (pour activer le back-office)

1. **Créer le projet** — [supabase.com](https://supabase.com) → *New project* (plan gratuit).
2. **Créer le schéma** — dashboard → *SQL Editor* → colle et exécute :
   1. [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) (tables, sécurité RLS, bucket photos)
   2. [`supabase/seed.sql`](supabase/seed.sql) (infos par défaut + line-up d'attente)
3. **Déclarer ton email admin** — toujours dans le SQL Editor :
   ```sql
   insert into public.admins (email) values ('ton-email@gmail.com');
   ```
   (l'email du compte Google avec lequel tu te connecteras)
4. **Renseigner les clés** — dashboard → *Settings → API* :
   ```bash
   cp .env.example .env.local   # puis remplis URL + clé anon
   ```
5. **Activer Google** (optionnel mais recommandé) —
   dashboard → *Authentication → Providers → Google* :
   - Crée un client OAuth sur [console.cloud.google.com](https://console.cloud.google.com/apis/credentials)
     (*Credentials → Create credentials → OAuth client ID → Web application*)
   - URI de redirection autorisée : `https://<ton-projet>.supabase.co/auth/v1/callback`
     (affichée dans le dashboard Supabase sur la page du provider Google)
   - Colle le *Client ID* et le *Client secret* dans Supabase, active le provider.
6. **(Alternative sans Google)** — crée un utilisateur email/mot de passe dans
   *Authentication → Users → Add user*, et ajoute son email dans `admins` (étape 3).
   Pense aussi à désactiver les inscriptions publiques si tu ne veux que des comptes
   créés à la main : *Authentication → Sign In / Up → Allow new users to sign up* → off.

## Déployer sur Vercel

1. Pousse ce repo sur GitHub.
2. [vercel.com](https://vercel.com) → *Import project* → sélectionne le repo (framework
   détecté automatiquement : Next.js).
3. Ajoute les deux variables d'environnement `NEXT_PUBLIC_SUPABASE_URL` et
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans les settings du projet Vercel.
4. Dans Supabase, ajoute l'URL du site déployé dans *Authentication → URL Configuration*
   (Site URL + Redirect URLs) pour que le retour de connexion Google fonctionne en prod.

Chaque `git push` sur `main` redéploie automatiquement le site.

## Structure du repo

```
├── design/                  # Archive de la maquette Claude Design (référence visuelle)
├── src/
│   ├── app/                 # Layout (fonts, metadata), page d'accueil, styles globaux
│   ├── components/          # Sections du site + modales du back-office
│   └── lib/                 # Client Supabase, types, chargement des données, données démo
├── supabase/
│   ├── migrations/          # Schéma SQL (tables + RLS + Storage)
│   └── seed.sql             # Données initiales + déclaration des admins
└── .env.example             # Modèle de configuration (à copier vers .env.local)
```
