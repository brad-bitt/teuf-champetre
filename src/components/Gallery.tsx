"use client";

import type { ChangeEvent } from "react";
import { PLACEHOLDER_PHOTOS } from "@/lib/demo-data";
import type { Photo } from "@/lib/types";
import styles from "./Gallery.module.css";

type Props = {
  photos: Photo[];
  adminOn: boolean;
  uploading: boolean;
  onRemove: (photo: Photo) => void;
  onAdd: (files: File[]) => void;
};

export default function Gallery({ photos, adminOn, uploading, onRemove, onAdd }: Props) {
  // Galerie vide ⇒ placeholders rayés façon maquette (non supprimables)
  const shown = photos.length > 0 ? photos : PLACEHOLDER_PHOTOS;

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onAdd(files);
    e.target.value = "";
  };

  return (
    <section id="galerie" className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>La Teuf en photos</h2>
        <span className={styles.subBadge}>Souvenirs des éditions passées 📸</span>

        <div className={styles.grid} data-reveal="">
          {shown.map((photo) => (
            <figure key={photo.id} className={styles.figure}>
              {photo.url ? (
                <div
                  role="img"
                  aria-label={photo.label}
                  className={styles.img}
                  style={{ backgroundImage: `url('${photo.url}')` }}
                />
              ) : (
                <div className={styles.placeholder}>
                  <span className={styles.placeholderLabel}>{photo.label}</span>
                </div>
              )}
              {adminOn && photo.url && (
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => onRemove(photo)}
                >
                  ✕ Supprimer
                </button>
              )}
            </figure>
          ))}
        </div>

        {adminOn && (
          <label className={styles.uploadZone}>
            {uploading ? "⏳ Envoi en cours…" : "📷 Ajouter des photos (clique ou dépose)"}
            <span className={styles.uploadHint}>
              Optimisées et servies par Cloudinary — visibles par tout le monde
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              disabled={uploading}
              className={styles.fileInput}
            />
          </label>
        )}
      </div>
    </section>
  );
}
