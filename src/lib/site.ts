/**
 * URL publique canonique du site — sert au sitemap, à la balise canonical et
 * aux cartes de partage. À surcharger via NEXT_PUBLIC_SITE_URL le jour où un
 * nom de domaine perso remplace l'URL Vercel.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://teuf-champetre.vercel.app";

export const SITE_NAME = "Teuf Champêtre";
