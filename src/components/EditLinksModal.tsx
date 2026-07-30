"use client";

import type { FormEvent } from "react";
import { LINK_DEFS, type Artist, type ArtistLinks } from "@/lib/types";
import styles from "./Modal.module.css";

type Props = {
  artist: Artist;
  onSave: (artist: Artist, links: ArtistLinks) => void;
  onClose: () => void;
};

const PLACEHOLDERS: Record<keyof ArtistLinks, string> = {
  spotify: "https://open.spotify.com/...",
  soundcloud: "https://soundcloud.com/...",
  instagram: "https://instagram.com/...",
};

export default function EditLinksModal({ artist, onSave, onClose }: Props) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const links = Object.fromEntries(
      LINK_DEFS.map(({ key }) => [key, String(fd.get(key) ?? "").trim() || null]),
    ) as ArtistLinks;
    onSave(artist, links);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>🔗 Liens</h3>
        <p className={styles.subtitle}>
          Liens de <strong>{artist.name}</strong> — laisse un champ vide pour retirer le lien.
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
