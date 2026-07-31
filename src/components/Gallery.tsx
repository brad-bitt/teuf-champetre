"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { PLACEHOLDER_PHOTOS } from "@/lib/demo-data";
import type { Photo } from "@/lib/types";
import styles from "./Gallery.module.css";

type Props = {
  photos: Photo[];
  adminOn: boolean;
  uploading: boolean;
  onRemove: (photo: Photo) => void;
  onAdd: (files: File[]) => void;
  /** Déplace la photo d'un index vers un autre (drag & drop ou flèches). */
  onMove: (from: number, to: number) => void;
  /** Renomme une photo (depuis la lightbox, en mode admin). */
  onRename: (photo: Photo, label: string) => void;
};

/** Photos visibles avant le bouton « voir plus » — limite le scroll. */
const PREVIEW_COUNT = 6;

/** Un label « IMG_0969.jpeg » n'apporte rien : on ne l'affiche pas en légende. */
const looksLikeFileName = (label: string) => /\.(jpe?g|png|webp|heic|gif|avif)$/i.test(label);

export default function Gallery({
  photos,
  adminOn,
  uploading,
  onRemove,
  onAdd,
  onMove,
  onRename,
}: Props) {
  // Galerie vide ⇒ placeholders rayés façon maquette (non supprimables)
  const real = photos.length > 0;
  const shown = real ? photos : PLACEHOLDER_PHOTOS;

  const [showAll, setShowAll] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  // En mode admin on montre tout : on ne réordonne pas ce qu'on ne voit pas.
  const expanded = adminOn || showAll;
  const visible = expanded ? shown : shown.slice(0, PREVIEW_COUNT);
  const hiddenCount = shown.length - visible.length;

  const openPhoto = openIndex === null ? null : shown[openIndex];
  const step = (delta: number) =>
    setOpenIndex((i) => (i === null ? i : (i + delta + shown.length) % shown.length));

  // Lightbox ouverte : clavier (Échap, ←/→) et scroll de la page verrouillé
  const lightboxOpen = openIndex !== null;
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      // En train de taper dans le champ de renommage : on laisse le clavier tranquille
      if ((e.target as HTMLElement | null)?.tagName === "INPUT") return;
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen]);

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onAdd(files);
    e.target.value = "";
  };

  const endDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <section id="galerie" className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>La Teuf en photos</h2>
        <span className={styles.subBadge}>Souvenirs des étapes passées 📸</span>

        <div className={styles.grid} data-reveal="">
          {visible.map((photo, i) => {
            const draggable = adminOn && real;
            const classes = [
              styles.figure,
              draggable ? styles.grabbable : "",
              dragIndex === i ? styles.dragging : "",
              overIndex === i && dragIndex !== null && dragIndex !== i ? styles.dragOver : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <figure
                key={photo.id}
                className={classes}
                draggable={draggable}
                onDragStart={draggable ? () => setDragIndex(i) : undefined}
                onDragOver={
                  draggable
                    ? (e) => {
                        e.preventDefault();
                        setOverIndex(i);
                      }
                    : undefined
                }
                onDrop={
                  draggable
                    ? (e) => {
                        e.preventDefault();
                        if (dragIndex !== null && dragIndex !== i) onMove(dragIndex, i);
                        endDrag();
                      }
                    : undefined
                }
                onDragEnd={endDrag}
              >
                {photo.url ? (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`Agrandir : ${photo.label || "photo"}`}
                    className={`${styles.img} ${styles.clickable}`}
                    style={{ backgroundImage: `url('${photo.url}')` }}
                    onClick={() => setOpenIndex(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenIndex(i);
                      }
                    }}
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
                {draggable && (
                  <div className={styles.moveBtns}>
                    <button
                      type="button"
                      className={styles.moveBtn}
                      disabled={i === 0}
                      onClick={() => onMove(i, i - 1)}
                      aria-label="Avancer la photo"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className={styles.moveBtn}
                      disabled={i === visible.length - 1}
                      onClick={() => onMove(i, i + 1)}
                      aria-label="Reculer la photo"
                    >
                      ›
                    </button>
                  </div>
                )}
              </figure>
            );
          })}
        </div>

        {!expanded && hiddenCount > 0 && (
          <div className={styles.moreRow}>
            <button type="button" className={styles.moreBtn} onClick={() => setShowAll(true)}>
              📸 Voir les {hiddenCount} autres photos
            </button>
          </div>
        )}
        {showAll && !adminOn && shown.length > PREVIEW_COUNT && (
          <div className={styles.moreRow}>
            <button type="button" className={styles.moreBtn} onClick={() => setShowAll(false)}>
              Replier la galerie ↑
            </button>
          </div>
        )}

        {adminOn && (
          <label className={styles.uploadZone}>
            {uploading ? "⏳ Envoi en cours…" : "📷 Ajouter des photos (clique ou dépose)"}
            <span className={styles.uploadHint}>
              Optimisées et servies par Cloudinary — visibles par tout le monde. Glisse les
              cartes (ou utilise ‹ ›) pour changer l&apos;ordre.
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

      {openPhoto?.url && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={openPhoto.label || "Photo en grand"}
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setOpenIndex(null)}
            aria-label="Fermer"
          >
            ✕
          </button>
          {shown.length > 1 && (
            <button
              type="button"
              className={`${styles.lightboxNav} ${styles.navPrev}`}
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              aria-label="Photo précédente"
            >
              ‹
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={openPhoto.largeUrl ?? openPhoto.url}
            alt={openPhoto.label || "Photo de la Teuf"}
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
          {shown.length > 1 && (
            <button
              type="button"
              className={`${styles.lightboxNav} ${styles.navNext}`}
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              aria-label="Photo suivante"
            >
              ›
            </button>
          )}
          <div className={styles.lightboxCaption} onClick={(e) => e.stopPropagation()}>
            {adminOn && real ? (
              <form
                key={openPhoto.id}
                className={styles.renameForm}
                onSubmit={(e: FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  const label = String(new FormData(e.currentTarget).get("label") ?? "").trim();
                  onRename(openPhoto, label);
                }}
              >
                <input
                  name="label"
                  defaultValue={openPhoto.label}
                  placeholder="Nom de la photo"
                  className={styles.renameInput}
                />
                <button type="submit" className={styles.renameBtn}>
                  Renommer
                </button>
              </form>
            ) : (
              openPhoto.label &&
              !looksLikeFileName(openPhoto.label) && (
                <span className={styles.lightboxLabel}>{openPhoto.label}</span>
              )
            )}
            <span className={styles.lightboxCount}>
              {(openIndex ?? 0) + 1} / {shown.length}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
