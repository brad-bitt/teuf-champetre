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

export type Photo = {
  id: string;
  /** Chemin dans le bucket Supabase Storage (vide pour les placeholders de démo). */
  path: string;
  label: string;
  /** URL publique de l'image — null ⇒ placeholder rayé façon maquette. */
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
