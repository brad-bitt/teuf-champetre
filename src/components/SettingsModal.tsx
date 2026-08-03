"use client";

import type { FormEvent } from "react";
import type { Settings } from "@/lib/types";
import styles from "./Modal.module.css";

type Props = {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onClose: () => void;
};

/** ISO (base) → valeur locale d'un <input type="datetime-local">. */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SettingsModal({ settings, onSave, onClose }: Props) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const eventStart = String(fd.get("event_start") ?? "").trim();
    onSave({
      edition: String(fd.get("edition") ?? "").trim() || settings.edition,
      dates: String(fd.get("dates") ?? "").trim() || settings.dates,
      lieu: String(fd.get("lieu") ?? "").trim() || settings.lieu,
      billetterie_url: String(fd.get("billetterie_url") ?? "").trim() || "#billetterie-bientot",
      // Vide autorisé : le bouton don disparaît simplement du site
      don_url: String(fd.get("don_url") ?? "").trim(),
      // L'input est en heure locale ; on stocke en ISO. Vide ⇒ pas de compte à rebours.
      event_start: eventStart ? new Date(eventStart).toISOString() : null,
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>⚙️ Infos du site</h3>
        <p className={styles.subtitle}>
          Édition, dates, lieu et lien billetterie — visibles dans le hero, la nav et le footer.
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label className={styles.field}>
            Édition
            <input name="edition" defaultValue={settings.edition} className={styles.input} />
          </label>
          <label className={styles.field}>
            Dates
            <input name="dates" defaultValue={settings.dates} className={styles.input} />
          </label>
          <label className={styles.field}>
            Lieu
            <input name="lieu" defaultValue={settings.lieu} className={styles.input} />
          </label>
          <label className={styles.field}>
            URL billetterie
            <input
              name="billetterie_url"
              defaultValue={settings.billetterie_url}
              placeholder="https://shotgun.live/..."
              className={styles.input}
            />
          </label>
          <label className={styles.field}>
            URL don (laisser vide pour masquer le bouton)
            <input
              name="don_url"
              defaultValue={settings.don_url}
              placeholder="https://www.helloasso.com/..."
              className={styles.input}
            />
          </label>
          <label className={styles.field}>
            Départ de la teuf (compte à rebours du hero — vide pour le masquer)
            <input
              type="datetime-local"
              name="event_start"
              defaultValue={toLocalInput(settings.event_start)}
              className={styles.input}
            />
          </label>
          <div className={styles.actions}>
            <button type="submit" className={styles.primaryBtn}>
              Enregistrer
            </button>
            <button type="button" className={styles.ghostBtn} onClick={onClose}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
