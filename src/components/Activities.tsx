"use client";

import type { FormEvent } from "react";
import {
  DAY_COLORS,
  FESTIVAL_DAYS,
  parseSlotDay,
  slotMinutes,
  slotWithoutDay,
  TAG_COLORS,
  type Activity,
} from "@/lib/types";
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
    const day = String(fd.get("day") ?? "Samedi");
    const time = String(fd.get("time") ?? "").trim();
    onAdd({
      name,
      // Le jour vit dans le créneau : « Samedi · 15h00 » (aucune migration)
      slot: `${day} · ${time || "Horaire à venir"}`,
      place: String(fd.get("place") ?? "").trim(),
    });
    form.reset();
  };

  // Regroupe par jour ; les créneaux sans jour reconnu vont dans « Jour mystère »
  const groups = FESTIVAL_DAYS.map((day) => ({
    day,
    color: DAY_COLORS[day],
    // Tri chronologique dans le jour (tri stable : à horaire égal, l'ordre admin)
    list: activities
      .filter((a) => parseSlotDay(a.slot) === day)
      .sort((a, b) => slotMinutes(a.slot) - slotMinutes(b.slot)),
  }));
  const unscheduled = activities.filter((a) => parseSlotDay(a.slot) === null);
  const ordered = [...groups.flatMap((g) => g.list), ...unscheduled];
  const indexOf = new Map(ordered.map((a, i) => [a.id, i]));

  const renderCard = (activity: Activity) => {
    const i = indexOf.get(activity.id) ?? 0;
    return (
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
        <div className={styles.slot}>{slotWithoutDay(activity.slot)}</div>
      </div>
    );
  };

  return (
    <section id="activites" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.headRow}>
          <h2 className={styles.title}>Les activités</h2>
          <span className={styles.note}>(pendant que le peloton récupère)</span>
        </div>

        {activities.length === 0 ? (
          <div className={styles.grid} data-reveal="">
            <div className={styles.card} style={{ background: CARD_BGS[0] }}>
              <div className={styles.name}>Programme en cours de mijotage…</div>
              <div className={styles.slot}>Bingo ? Pétanque ? Reviens bientôt !</div>
            </div>
          </div>
        ) : (
          <>
            {groups.map(
              ({ day, color, list }) =>
                (list.length > 0 || adminOn) && (
                  <div key={day} className={styles.dayBlock}>
                    <div className={styles.dayHeader}>
                      <span className={styles.dayChip} style={{ color }}>
                        {day}
                      </span>
                      <span className={styles.dayLine} aria-hidden="true" />
                    </div>
                    {list.length > 0 ? (
                      <div className={styles.grid} data-reveal="">
                        {list.map(renderCard)}
                      </div>
                    ) : (
                      <p className={styles.dayEmpty}>
                        Rien de prévu ce jour-là — ajoute une activité ci-dessous.
                      </p>
                    )}
                  </div>
                ),
            )}
            {unscheduled.length > 0 && (
              <div className={styles.dayBlock}>
                <div className={styles.dayHeader}>
                  <span className={styles.dayChip} style={{ color: "var(--blue)" }}>
                    Jour mystère
                  </span>
                  <span className={styles.dayLine} aria-hidden="true" />
                </div>
                <div className={styles.grid} data-reveal="">
                  {unscheduled.map(renderCard)}
                </div>
              </div>
            )}
          </>
        )}

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
              Jour
              <select name="day" defaultValue="Samedi" className={styles.input}>
                {FESTIVAL_DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              Horaire
              <input name="time" placeholder="15h00" className={styles.input} />
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
