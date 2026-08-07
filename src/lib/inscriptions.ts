/**
 * Mémoire locale des inscriptions aux activités : le pseudo utilisé (pré-rempli
 * au prochain formulaire) et les ids des inscriptions faites depuis ce
 * navigateur — pas d'authentification, c'est ce qui permet d'afficher le
 * bouton « se désinscrire » uniquement sur ses propres inscriptions.
 */

const PSEUDO_KEY = "teuf-pseudo";
const IDS_KEY = "teuf-inscriptions";

export function rememberedPseudo(): string {
  try {
    return localStorage.getItem(PSEUDO_KEY) ?? "";
  } catch {
    return "";
  }
}

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(IDS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  try {
    localStorage.setItem(IDS_KEY, JSON.stringify(ids));
  } catch {
    // localStorage indisponible (navigation privée…) : tant pis, pas de mémoire
  }
}

/** À appeler après une inscription réussie. */
export function rememberSignup(id: string, pseudo: string) {
  try {
    localStorage.setItem(PSEUDO_KEY, pseudo);
  } catch {
    /* voir writeIds */
  }
  writeIds([...readIds(), id]);
}

export function forgetSignup(id: string) {
  writeIds(readIds().filter((v) => v !== id));
}

/** Les inscriptions faites depuis ce navigateur. */
export function mySignupIds(): Set<string> {
  return new Set(readIds());
}
