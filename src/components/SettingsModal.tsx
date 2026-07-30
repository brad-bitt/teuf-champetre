"use client";

import type { FormEvent } from "react";
import type { Settings } from "@/lib/types";
import styles from "./Modal.module.css";

type Props = {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onClose: () => void;
};

export default function SettingsModal({ settings, onSave, onClose }: Props) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      edition: String(fd.get("edition") ?? "").trim() || settings.edition,
      dates: String(fd.get("dates") ?? "").trim() || settings.dates,
      lieu: String(fd.get("lieu") ?? "").trim() || settings.lieu,
      billetterie_url: String(fd.get("billetterie_url") ?? "").trim() || "#billetterie-bientot",
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
