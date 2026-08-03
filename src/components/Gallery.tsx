"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
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

/** Nombre de rangées pleines affichées avant le bouton « voir plus ». */
const PREVIEW_ROWS = 2;

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
  // Les photos repliées ne sont montées qu'au premier dépliage :
  // pas de téléchargement de vignettes pour qui ne déplie jamais.
  const [everOpened, setEverOpened] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // Grand format en cours de chargement ⇒ vinyle qui tourne dans la lightbox
  const [lightboxLoading, setLightboxLoading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  // L'aperçu = PREVIEW_ROWS rangées PLEINES : on mesure le nombre réel de
  // colonnes de la grille (elle s'adapte à la largeur d'écran) pour ne jamais
  // laisser de trou, et pour que la grille dépliée s'aligne pile en dessous.
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [cols, setCols] = useState(3);
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const update = () =>
      setCols(getComputedStyle(grid).gridTemplateColumns.split(" ").length);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);
  const previewCount = Math.max(cols * PREVIEW_ROWS, 4);

  // En mode admin on montre tout : on ne réordonne pas ce qu'on ne voit pas.
  const primary = adminOn ? shown : shown.slice(0, previewCount);
  const extra = adminOn ? [] : shown.slice(previewCount);

  const openPhoto = openIndex === null ? null : shown[openIndex];
  const step = (delta: number) =>
    setOpenIndex((i) => (i === null ? i : (i + delta + shown.length) % shown.length));

  // Chaque photo ouverte repart en « chargement » jusqu'à son onLoad
  useEffect(() => {
    if (openIndex !== null) setLightboxLoading(true);
  }, [openIndex]);

  const expand = () => {
    setEverOpened(true);
    // Double rAF : laisse le navigateur peindre l'état replié (0fr) avant de
    // passer à 1fr, sinon la transition ne se déclenche pas au premier dépliage.
    requestAnimationFrame(() => requestAnimationFrame(() => setShowAll(true)));
  };

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

  // Précharge les grands formats voisins : la navigation ‹ › est instantanée
  useEffect(() => {
    if (openIndex === null || shown.length < 2) return;
    for (const delta of [1, -1]) {
      const neighbor = shown[(openIndex + delta + shown.length) % shown.length];
      const url = neighbor.largeUrl ?? neighbor.url;
      if (url) new Image().src = url;
    }
  }, [openIndex, shown]);

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onAdd(files);
    e.target.value = "";
  };

  const endDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  /** Une carte photo — `i` est l'index GLOBAL dans `shown` (lightbox, drag & drop). */
  const renderFigure = (photo: Photo, i: number) => {
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
        onDragStart={
          draggable
            ? (e) => {
                // Firefox exige un setData pour démarrer le drag
                e.dataTransfer?.setData("text/plain", photo.id);
                setDragIndex(i);
              }
            : undefined
        }
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
            onClick={() => setOpenIndex(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpenIndex(i);
              }
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              srcSet={photo.srcSet ?? undefined}
              sizes="(max-width: 560px) 92vw, 280px"
              alt=""
              loading="lazy"
              decoding="async"
              className={styles.thumb}
              draggable={false}
            />
          </div>
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderLabel}>{photo.label}</span>
          </div>
        )}
        {adminOn && photo.url && (
          <button type="button" className={styles.removeBtn} onClick={() => onRemove(photo)}>
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
              disabled={i === shown.length - 1}
              onClick={() => onMove(i, i + 1)}
              aria-label="Reculer la photo"
            >
              ›
            </button>
          </div>
        )}
      </figure>
    );
  };

  return (
    <section id="galerie" className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>La Teuf en photos</h2>
        <span className={styles.subBadge}>Souvenirs des étapes passées 📸</span>

        <div>
          <div ref={gridRef} className={styles.grid} data-reveal="">
            {primary.map((photo, i) => renderFigure(photo, i))}
          </div>

          {/* Photos au-delà de 6 : hauteur animée 0fr ⇄ 1fr au (dé)pliage */}
          {extra.length > 0 && everOpened && (
            <div
              className={`${styles.extraWrap} ${showAll ? styles.extraOpen : ""}`}
              inert={!showAll}
            >
              <div className={styles.extraInner}>
                <div className={`${styles.grid} ${styles.gridExtra}`}>
                  {extra.map((photo, i) => renderFigure(photo, i + previewCount))}
                </div>
              </div>
            </div>
          )}
        </div>

        {!adminOn && extra.length > 0 && (
          <div className={styles.moreRow}>
            {showAll ? (
              <button type="button" className={styles.moreBtn} onClick={() => setShowAll(false)}>
                Replier la galerie ↑
              </button>
            ) : (
              <button type="button" className={styles.moreBtn} onClick={expand}>
                📸 Voir les {extra.length} autres photos
              </button>
            )}
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
          {lightboxLoading && (
            <div className={styles.vinyl} aria-hidden="true">
              <span className={styles.vinylDot} />
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={openPhoto.id}
            src={openPhoto.largeUrl ?? openPhoto.url}
            alt={openPhoto.label || "Photo de la Teuf"}
            className={`${styles.lightboxImg} ${lightboxLoading ? styles.lightboxImgLoading : ""}`}
            onLoad={() => setLightboxLoading(false)}
            onError={() => setLightboxLoading(false)}
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
