/**
 * Reconstruit des dates ISO (exigées par les données structurées Google,
 * champ critique startDate) à partir des champs texte libre du back-office :
 * `dates` (« 11–13 septembre ») + `edition` (« Édition 2026 » → l'année).
 * Retourne null si le texte n'est pas reconnu — l'appelant retombe alors sur
 * un schéma sans Event plutôt que d'émettre un Event invalide.
 */

const MONTHS = [
  "janvier",
  "fevrier",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "aout",
  "septembre",
  "octobre",
  "novembre",
  "decembre",
];

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export function parseFestivalDates(
  dates: string,
  edition: string,
): { startDate: string; endDate: string } | null {
  const year =
    edition.match(/\b(20\d{2})\b/)?.[1] ?? dates.match(/\b(20\d{2})\b/)?.[1];
  if (!year) return null;

  // Chaque jour (1-2 chiffres isolés, « 2026 » ne matche pas), suivi ou non
  // d'un nom de mois : « 11–13 septembre » → [{11, ?}, {13, septembre}]
  const tokens: Array<{ day: number; month: number | null }> = [];
  const re = new RegExp(`\\b(\\d{1,2})(?:er)?\\b\\s*(${MONTHS.join("|")})?`, "g");
  for (const m of normalize(dates).matchAll(re)) {
    const day = parseInt(m[1], 10);
    if (day < 1 || day > 31) continue;
    tokens.push({ day, month: m[2] ? MONTHS.indexOf(m[2]) + 1 : null });
  }
  if (tokens.length === 0) return null;

  // « 11–13 septembre » : le 11 hérite du mois du 13 (propagation arrière)
  for (let i = tokens.length - 2; i >= 0; i--) {
    tokens[i].month ??= tokens[i + 1].month;
  }
  const first = tokens[0];
  const last = tokens[tokens.length - 1];
  if (first.month === null || last.month === null) return null;

  const iso = (month: number, day: number) =>
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { startDate: iso(first.month, first.day), endDate: iso(last.month, last.day) };
}
