"use client";

import type { FormEvent } from "react";
import type { Info } from "@/lib/types";
import styles from "./Modal.module.css";

/** Champs modifiables d'une carte info pratique. */
export type InfoFields = {
  emoji: string;
  title: string;
  body: string;
};

type Props = {
  info: Info;
  onSave: (info: Info, fields: InfoFields) => void;
  onClose: () => void;
};

export default function EditInfoModal({ info, onSave, onClose }: Props) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "").trim();
    if (!title) return;
    onSave(info, {
      emoji: String(fd.get("emoji") ?? "").trim() || "📌",
      title,
      body: String(fd.get("body") ?? "").trim(),
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>✏️ Modifier l&apos;info</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label className={styles.field}>
            Emoji
            <input name="emoji" defaultValue={info.emoji} placeholder="🚗" className={styles.input} />
          </label>
          <label className={styles.field}>
            Titre
            <input name="title" required defaultValue={info.title} className={styles.input} />
          </label>
          <label className={styles.field}>
            Texte
            <textarea
              name="body"
              defaultValue={info.body}
              rows={4}
              placeholder="Parking dans le pré d'à côté…"
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
