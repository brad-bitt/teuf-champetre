import type { CSSProperties } from "react";
import type { SectionKey } from "./types";

/**
 * Décorations thématiques de l'édition (thème vélo / Tour de France 2026).
 * Tout le folklore visuel « qui change avec le thème » est rassemblé ici :
 * pour l'édition suivante, c'est LE fichier à éditer (avec les textes des
 * bandeaux dans FestivalSite et le vocabulaire des sections).
 */

/** L'émoji qui avance sur la bordure de la nav au fil du scroll. */
export const SCROLL_RIDER = "🚴";

type Sticker = {
  emoji: string;
  /** Position dans la zone de padding de la section (jamais sur le contenu). */
  style: CSSProperties;
};

/**
 * Stickers posés « à la main » dans les coins des sections — 2 par section
 * maximum pour ne pas surcharger. Les positions hautes (top: 54px) passent
 * sous le bandeau défilant ; les flèches admin vivent à top: 8px à droite.
 */
export const SECTION_STICKERS: Record<SectionKey, Sticker[]> = {
  lineup: [
    { emoji: "🌻", style: { top: 58, left: 16, transform: "rotate(-12deg)" } },
    { emoji: "🐓", style: { bottom: 22, right: 22, transform: "rotate(8deg)" } },
  ],
  activities: [
    { emoji: "🍄", style: { top: 60, right: 28, transform: "rotate(12deg)" } },
    { emoji: "🌾", style: { bottom: 24, left: 20, transform: "rotate(-8deg)" } },
  ],
  infos: [
    { emoji: "⛰️", style: { top: 58, left: 20, transform: "rotate(-6deg)" } },
    { emoji: "🧺", style: { bottom: 22, right: 26, transform: "rotate(10deg)" } },
  ],
  gallery: [
    { emoji: "🌼", style: { top: 58, right: 34, transform: "rotate(-10deg)" } },
    { emoji: "🚵", style: { bottom: 24, left: 18, transform: "rotate(6deg)" } },
  ],
};
