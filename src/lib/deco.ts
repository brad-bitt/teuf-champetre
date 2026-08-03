import type { CSSProperties } from "react";
import type { SectionKey } from "./types";

/**
 * Décorations thématiques de l'édition (thème vélo / Tour de France 2026).
 * Tout le folklore visuel « qui change avec le thème » est rassemblé ici :
 * pour l'édition suivante, c'est LE fichier à éditer (avec les textes des
 * bandeaux dans FestivalSite et le vocabulaire des sections).
 */

/** L'émoji qui avance sur la route pointillée du bord droit au fil du scroll. */
export const SCROLL_RIDER = "🚴";

type Sticker = {
  emoji: string;
  /** Couleur de la pastille (palette du site, différente du fond de la section). */
  bg: string;
  /** Position sur les bords de la section — négatif ⇒ demi-cercle qui dépasse. */
  style: CSSProperties;
};

/**
 * Pastilles rondes façon décorations du hero (soleil, rond à pois) : un émoji
 * dans un cercle bordé de noir, posé à cheval sur le bord de la section.
 * Un 🍄 par section — le motif classique de la Teuf. Les positions hautes
 * passent sous le bandeau défilant (~40px).
 */
export const SECTION_STICKERS: Record<SectionKey, Sticker[]> = {
  // Section jaune
  lineup: [
    { emoji: "🌻", bg: "var(--pink)", style: { top: 90, left: -26, transform: "rotate(-10deg)" } },
    { emoji: "🍄", bg: "var(--cream)", style: { top: 220, right: -28, transform: "rotate(8deg)" } },
    { emoji: "🏆", bg: "var(--green)", style: { bottom: 60, left: -30, transform: "rotate(6deg)" } },
  ],
  // Section bleue
  activities: [
    { emoji: "🍄", bg: "var(--yellow)", style: { top: 110, right: -26, transform: "rotate(10deg)" } },
    { emoji: "🌾", bg: "var(--pink)", style: { bottom: 70, left: -28, transform: "rotate(-8deg)" } },
  ],
  // Section orange
  infos: [
    { emoji: "🚜", bg: "var(--cream)", style: { top: 100, left: -26, transform: "rotate(-6deg)" } },
    { emoji: "🍄", bg: "var(--yellow)", style: { bottom: 130, left: -30, transform: "rotate(-9deg)" } },
    { emoji: "🧺", bg: "var(--green)", style: { bottom: 50, right: -28, transform: "rotate(8deg)" } },
  ],
  // Section verte
  gallery: [
    { emoji: "🌼", bg: "var(--pink)", style: { top: 100, right: -26, transform: "rotate(-8deg)" } },
    { emoji: "🍄", bg: "var(--cream)", style: { top: 240, left: -28, transform: "rotate(9deg)" } },
    { emoji: "🚵", bg: "var(--yellow)", style: { bottom: 70, right: -30, transform: "rotate(6deg)" } },
  ],
};
