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
};

export type Settings = {
  edition: string;
  dates: string;
  lieu: string;
  billetterie_url: string;
};

export type FestivalData = {
  settings: Settings;
  artists: Artist[];
  activities: Activity[];
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
