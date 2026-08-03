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
  /** Diamètre de la pastille en px — volontairement irrégulier d'une pastille à l'autre. */
  size: number;
  /** Position éparpillée dans la section — négatif ⇒ demi-cercle qui dépasse du bord. */
  style: CSSProperties;
};

/**
 * Pastilles rondes façon décorations du hero (soleil, rond à pois) : un émoji
 * dans un cercle bordé de noir. Tailles et positions volontairement
 * irrégulières, « éparpillées à la main » (pas de vrai aléatoire : le rendu
 * serveur et le client doivent produire le même HTML). Un 🍄 par section —
 * le motif classique de la Teuf.
 */
export const SECTION_STICKERS: Record<SectionKey, Sticker[]> = {
  // Section jaune
  lineup: [
    { emoji: "🌻", bg: "var(--pink)", size: 120, style: { top: "9%", left: -26, transform: "rotate(-10deg)" } },
    { emoji: "🍄", bg: "var(--cream)", size: 56, style: { top: "34%", right: "5%", transform: "rotate(8deg)" } },
    { emoji: "🌾", bg: "var(--blue)", size: 84, style: { top: "62%", right: "2%", transform: "rotate(-7deg)" } },
    { emoji: "🏆", bg: "var(--green)", size: 66, style: { bottom: "11%", left: "3%", transform: "rotate(6deg)" } },
    { emoji: "🌼", bg: "var(--cream)", size: 44, style: { top: "48%", left: "5%", transform: "rotate(12deg)" } },
  ],
  // Section bleue
  activities: [
    { emoji: "🍄", bg: "var(--yellow)", size: 132, style: { top: "24%", right: -32, transform: "rotate(10deg)" } },
    { emoji: "🌼", bg: "var(--cream)", size: 52, style: { top: "14%", left: "3%", transform: "rotate(-11deg)" } },
    { emoji: "🌾", bg: "var(--pink)", size: 74, style: { top: "58%", left: "6%", transform: "rotate(-8deg)" } },
    { emoji: "🌻", bg: "var(--green)", size: 60, style: { bottom: "12%", right: "5%", transform: "rotate(7deg)" } },
  ],
  // Section orange
  infos: [
    { emoji: "🚜", bg: "var(--cream)", size: 108, style: { top: "13%", left: "4%", transform: "rotate(-6deg)" } },
    { emoji: "🌾", bg: "var(--blue)", size: 58, style: { top: "38%", right: -24, transform: "rotate(9deg)" } },
    { emoji: "🍄", bg: "var(--yellow)", size: 48, style: { bottom: "17%", left: -16, transform: "rotate(-9deg)" } },
    { emoji: "🧺", bg: "var(--green)", size: 92, style: { bottom: "31%", right: "5%", transform: "rotate(8deg)" } },
    { emoji: "🌻", bg: "var(--pink)", size: 54, style: { top: "10%", right: "8%", transform: "rotate(-12deg)" } },
  ],
  // Section verte
  gallery: [
    { emoji: "🌼", bg: "var(--pink)", size: 84, style: { top: "10%", right: "7%", transform: "rotate(-8deg)" } },
    { emoji: "🌻", bg: "var(--yellow)", size: 56, style: { top: "22%", left: "4%", transform: "rotate(10deg)" } },
    { emoji: "🍄", bg: "var(--cream)", size: 124, style: { top: "47%", left: -28, transform: "rotate(9deg)" } },
    { emoji: "🍄", bg: "var(--blue)", size: 46, style: { bottom: "28%", right: "4%", transform: "rotate(-9deg)" } },
    { emoji: "🚵", bg: "var(--yellow)", size: 72, style: { bottom: "7%", right: -22, transform: "rotate(6deg)" } },
  ],
};
