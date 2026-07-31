"use client";

import type { FormEvent } from "react";
import { FESTIVAL_DAYS, parseSlotDay, slotWithoutDay, type Activity } from "@/lib/types";
import styles from "./Modal.module.css";

/** Champs modifiables d'une activité (le jour vit dans `slot`). */
export type ActivityFields = {
  name: string;
  slot: string;
  place: string;
};

type Props = {
  activity: Activity;
  onSave: (activity: Activity, fields: ActivityFields) => void;
  onClose: () => void;
};

export default function EditActivityModal({ activity, onSave, onClose }: Props) {
  const currentDay = parseSlotDay(activity.slot) ?? "Samedi";
  const currentTime = slotWithoutDay(activity.slot);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    if (!name) return;
    const day = String(fd.get("day") ?? currentDay);
    const time = String(fd.get("time") ?? "").trim();
    onSave(activity, {
      name,
      slot: `${day} · ${time || "Horaire à venir"}`,
      place: String(fd.get("place") ?? "").trim(),
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>✏️ Modifier l&apos;activité</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label className={styles.field}>
            Nom
            <input name="name" required defaultValue={activity.name} className={styles.input} />
          </label>
          <label className={styles.field}>
            Jour
            <select name="day" defaultValue={currentDay} className={styles.input}>
              {FESTIVAL_DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            Horaire
            <input
              name="time"
              defaultValue={currentTime === "Horaire à venir" ? "" : currentTime}
              placeholder="15h00"
              className={styles.input}
            />
          </label>
          <label className={styles.field}>
            Lieu
            <input
              name="place"
              defaultValue={activity.place}
              placeholder="Sous le chapiteau"
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
