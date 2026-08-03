"use client";

import type { FormEvent } from "react";
import type { Info } from "@/lib/types";
import styles from "./InfosPratiques.module.css";

type Props = {
  infos: Info[];
  adminOn: boolean;
  onRemove: (info: Info) => void;
  onEdit: (info: Info) => void;
  onAdd: (fields: { emoji: string; title: string; body: string }) => void;
};

/** Fonds des cartes, en rotation — tout sauf l'orange de la section. */
const CARD_BGS = ["var(--cream)", "var(--yellow)", "var(--blue)", "var(--green)"];

export default function InfosPratiques({ infos, adminOn, onRemove, onEdit, onAdd }: Props) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = String(fd.get("title") ?? "").trim();
    if (!title) return;
    onAdd({
      emoji: String(fd.get("emoji") ?? "").trim() || "📌",
      title,
      body: String(fd.get("body") ?? "").trim(),
    });
    form.reset();
  };

  return (
    <section id="infos" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.headRow}>
          <h2 className={styles.title}>Infos pratiques</h2>
          <span className={styles.note}>(le carnet de route)</span>
        </div>

        {infos.length === 0 ? (
          <div className={styles.grid} data-reveal="">
            <div className={styles.card} style={{ background: CARD_BGS[0] }}>
              <div className={styles.cardTitle}>🗺️ Infos en cours de rédaction…</div>
              <p className={styles.body}>Accès, camping, quoi apporter : reviens bientôt !</p>
            </div>
          </div>
        ) : (
          <div className={styles.grid} data-reveal="">
            {infos.map((info, i) => (
              <div
                key={info.id}
                className={styles.card}
                style={{ background: CARD_BGS[i % CARD_BGS.length] }}
              >
                <div className={styles.cardTop}>
                  <div className={styles.cardTitle}>
                    <span className={styles.emoji}>{info.emoji}</span>
                    {info.title}
                  </div>
                  {adminOn && (
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => onRemove(info)}
                      aria-label={`Supprimer ${info.title}`}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className={styles.body}>{info.body}</p>
                {adminOn && (
                  <button type="button" className={styles.editBtn} onClick={() => onEdit(info)}>
                    ✏️ Modifier
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {adminOn && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.field}>
              Emoji
              <input name="emoji" placeholder="🚗" className={styles.inputSmall} />
            </label>
            <label className={styles.field}>
              Titre
              <input name="title" required placeholder="Accès" className={styles.input} />
            </label>
            <label className={styles.fieldWide}>
              Texte
              <input
                name="body"
                placeholder="Parking dans le pré d'à côté…"
                className={styles.input}
              />
            </label>
            <button type="submit" className={styles.submit}>
              + Ajouter l&apos;info
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
