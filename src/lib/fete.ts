/**
 * Mode fête : la nuit tombe sur le site (voile sombre + projecteurs colorés
 * qui balayent la page, styles dans globals.css sur html[data-fete]).
 * Déclenché en cliquant sur le titre du hero, mémorisé dans le navigateur.
 */

const STORAGE_KEY = "teuf-mode-fete";

/** Réapplique le choix mémorisé (à appeler au montage, côté client). */
export function initFeteMode() {
  if (localStorage.getItem(STORAGE_KEY) === "on") {
    document.documentElement.dataset.fete = "on";
  }
}

/** Bascule le mode fête et retourne le nouvel état (true = fête allumée). */
export function toggleFeteMode(): boolean {
  const on = document.documentElement.dataset.fete !== "on";
  if (on) {
    document.documentElement.dataset.fete = "on";
  } else {
    delete document.documentElement.dataset.fete;
  }
  localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  return on;
}

/** État courant (après montage uniquement). */
export function isFeteMode(): boolean {
  return document.documentElement.dataset.fete === "on";
}
