"use client";

import type { FormEvent } from "react";
import {
  FESTIVAL_DAYS,
  LINK_DEFS,
  parseSlotDay,
  slotWithoutDay,
  type Artist,
  type ArtistLinks,
} from "@/lib/types";
import styles from "./Modal.module.css";

/** Champs modifiables d'un artiste (le jour vit dans `slot`). */
export type ArtistFields = {
  name: string;
  genre: string;
  slot: string;
  spotify: string | null;
  soundcloud: string | null;
  instagram: string | null;
};

type Props = {
  artist: Artist;
  onSave: (artist: Artist, fields: ArtistFields) => void;
  onClose: () => void;
};

const PLACEHOLDERS: Record<keyof ArtistLinks, string> = {
  spotify: "https://open.spotify.com/...",
  soundcloud: "https://soundcloud.com/...",
  instagram: "https://instagram.com/...",
};

export default function EditArtistModal({ artist, onSave, onClose }: Props) {
  const currentDay = parseSlotDay(artist.slot) ?? "Samedi";
  const currentTime = slotWithoutDay(artist.slot);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    if (!name) return;
    const day = String(fd.get("day") ?? currentDay);
    const time = String(fd.get("time") ?? "").trim();
    onSave(artist, {
      name,
      genre: String(fd.get("genre") ?? "").trim() || "Mystère",
      slot: `${day} · ${time || "Horaire à venir"}`,
      spotify: String(fd.get("spotify") ?? "").trim() || null,
      soundcloud: String(fd.get("soundcloud") ?? "").trim() || null,
      instagram: String(fd.get("instagram") ?? "").trim() || null,
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>✏️ Modifier l&apos;étape</h3>
        <p className={styles.subtitle}>
          Tout est modifiable — laisse un lien vide pour le retirer.
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label className={styles.field}>
            Nom
            <input name="name" required defaultValue={artist.name} className={styles.input} />
          </label>
          <label className={styles.field}>
            Genre
            <input name="genre" defaultValue={artist.genre} className={styles.input} />
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
              placeholder="23h00"
              className={styles.input}
            />
          </label>
          {LINK_DEFS.map(({ key, label }) => (
            <label key={key} className={styles.field}>
              {label}
              <input
                name={key}
                type="url"
                defaultValue={artist[key] ?? ""}
                placeholder={PLACEHOLDERS[key]}
                className={styles.input}
              />
            </label>
          ))}
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
