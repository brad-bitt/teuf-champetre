import type React from "react";

export type Artist = {
  id: string;
  name: string;
  genre: string;
  slot: string;
  spotify: string | null;
  soundcloud: string | null;
  instagram: string | null;
  position: number;
};

export type Activity = {
  id: string;
  name: string;
  slot: string;
  place: string;
  position: number;
};

export type Photo = {
  id: string;
  /** Identifiant Cloudinary (vide pour les placeholders de démo). */
  publicId: string;
  label: string;
  /** URL d'affichage optimisée — null ⇒ placeholder rayé façon maquette. */
  url: string | null;
  /** srcset des vignettes (400/800px) pour laisser le navigateur choisir. */
  srcSet: string | null;
  /** URL grand format pour la lightbox. */
  largeUrl: string | null;
  /** Ordre d'affichage, modifiable par drag & drop dans le back-office. */
  position: number;
};

export type Settings = {
  edition: string;
  dates: string;
  lieu: string;
  billetterie_url: string;
  /** URL de la cagnotte HelloAsso — vide ⇒ le bouton don est masqué. */
  don_url: string;
  /** Début de l'événement (ISO) pour le compte à rebours — null/absent ⇒ pas de compte à rebours. */
  event_start?: string | null;
};

/** Une carte de la section « Infos pratiques » (accès, camping, à apporter…). */
export type Info = {
  id: string;
  emoji: string;
  title: string;
  body: string;
  position: number;
};

export type FestivalData = {
  settings: Settings;
  artists: Artist[];
  activities: Activity[];
  infos: Info[];
  photos: Photo[];
};

export type ArtistLinks = Pick<Artist, "spotify" | "soundcloud" | "instagram">;

export const LINK_DEFS: Array<{ key: keyof ArtistLinks; label: string }> = [
  { key: "spotify", label: "Spotify" },
  { key: "soundcloud", label: "SoundCloud" },
  { key: "instagram", label: "Insta" },
];

/** Couleurs des badges de genre, dans l'ordre de la maquette. */
export const TAG_COLORS = ["#ffd23f", "#ff5fa8", "#a6e05a", "#9ecbff"];

/** Les trois jours du festival, dans l'ordre d'affichage. */
export const FESTIVAL_DAYS = ["Vendredi", "Samedi", "Dimanche"] as const;
export type FestivalDay = (typeof FESTIVAL_DAYS)[number];

/** Couleur d'accent de chaque jour — identique dans toutes les sections. */
export const DAY_COLORS: Record<FestivalDay, string> = {
  Vendredi: "var(--pink)",
  Samedi: "var(--yellow)",
  Dimanche: "var(--green)",
};

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/**
 * Extrait le jour d'un créneau « Samedi · 23h30 » (insensible à la casse et
 * aux accents). Le jour reste stocké DANS le champ slot : pas de migration,
 * les données existantes se rangent toutes seules.
 */
export function parseSlotDay(slot: string): FestivalDay | null {
  const n = normalize(slot);
  return FESTIVAL_DAYS.find((d) => n.startsWith(normalize(d))) ?? null;
}

/**
 * Minutes depuis minuit pour trier chronologiquement dans un jour
 * (« 23h30 » → 1410). Sans horaire reconnu : classé en fin de journée.
 */
export function slotMinutes(slot: string): number {
  const m = slotWithoutDay(slot).match(/(\d{1,2})\s*[h:]\s*(\d{2})?/);
  if (!m) return Number.POSITIVE_INFINITY;
  return parseInt(m[1], 10) * 60 + (m[2] ? parseInt(m[2], 10) : 0);
}

/** L'horaire sans le jour : « Samedi · 23h30 » → « 23h30 » (l'en-tête de groupe affiche déjà le jour). */
export function slotWithoutDay(slot: string): string {
  const day = parseSlotDay(slot);
  if (!day) return slot;
  const rest = slot.replace(new RegExp(`^\\s*${day}\\s*[·•\\-–—:]?\\s*`, "i"), "").trim();
  return rest || "Horaire à venir";
}

/**
 * Les 4 maillots du Tour, en rotation sur les badges de genre des artistes :
 * jaune (leader), vert (sprinteur), à pois (grimpeur), blanc (jeune espoir).
 * Le `title` s'affiche au survol, pour les connaisseurs.
 */
export const MAILLOTS: Array<{ title: string; style: React.CSSProperties }> = [
  { title: "Maillot jaune — la tête d'affiche", style: { background: "var(--yellow)" } },
  { title: "Maillot vert — le sprinteur", style: { background: "var(--green)" } },
  {
    title: "Maillot à pois — le grimpeur",
    style: {
      backgroundColor: "#fff",
      backgroundImage: "radial-gradient(circle, var(--orange) 24%, transparent 26%)",
      backgroundSize: "12px 12px",
    },
  },
  { title: "Maillot blanc — le jeune espoir", style: { background: "#fff" } },
];
