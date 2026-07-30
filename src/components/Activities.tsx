"use client";

import type { FormEvent } from "react";
import { TAG_COLORS, type Activity } from "@/lib/types";
import styles from "./Activities.module.css";

type Props = {
  activities: Activity[];
  adminOn: boolean;
  onRemove: (activity: Activity) => void;
  onAdd: (fields: { name: string; slot: string; place: string }) => void;
};

/** Fonds des cartes, en rotation — tout sauf le bleu de la section. */
const CARD_BGS = ["var(--cream)", "var(--yellow)", "var(--pink)", "var(--green)"];

export default function Activities({ activities, adminOn, onRemove, onAdd }: Props) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    if (!name) return;
    onAdd({
      name,
      slot: String(fd.get("slot") ?? "").trim() || "Horaire à venir",
      place: String(fd.get("place") ?? "").trim(),
    });
    form.reset();
  };

  return (
    <section id="activites" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.headRow}>
          <h2 className={styles.title}>Les activités</h2>
          <span className={styles.note}>(pendant que le peloton récupère)</span>
        </div>

        <div className={styles.grid} data-reveal="">
          {activities.length === 0 && (
            <div className={styles.card} style={{ background: CARD_BGS[0] }}>
              <div className={styles.name}>Programme en cours de mijotage…</div>
              <div className={styles.slot}>Bingo ? Pétanque ? Reviens bientôt !</div>
            </div>
          )}
          {activities.map((activity, i) => (
            <div
              key={activity.id}
              className={styles.card}
              style={{ background: CARD_BGS[i % CARD_BGS.length] }}
            >
              <div className={styles.cardTop}>
                {activity.place ? (
                  <span
                    className={styles.tag}
                    style={{ background: TAG_COLORS[i % TAG_COLORS.length] }}
                  >
                    📍 {activity.place}
                  </span>
                ) : (
                  <span />
                )}
                {adminOn && (
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => onRemove(activity)}
                    aria-label={`Supprimer ${activity.name}`}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className={styles.name}>{activity.name}</div>
              <div className={styles.slot}>{activity.slot}</div>
            </div>
          ))}
        </div>

        {adminOn && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.field}>
              Nom
              <input
                name="name"
                required
                placeholder="Bingo champêtre"
                className={styles.input}
              />
            </label>
            <label className={styles.field}>
              Horaire
              <input name="slot" placeholder="Samedi · 15h00" className={styles.input} />
            </label>
            <label className={styles.field}>
              Lieu
              <input name="place" placeholder="Sous le chapiteau" className={styles.input} />
            </label>
            <button type="submit" className={styles.submit}>
              + Ajouter l&apos;activité
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
