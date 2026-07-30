"use client";

import type { FormEvent } from "react";
import { LINK_DEFS, MAILLOTS, type Artist } from "@/lib/types";
import styles from "./LineUp.module.css";

type Props = {
  artists: Artist[];
  adminOn: boolean;
  onRemove: (artist: Artist) => void;
  onEditLinks: (artist: Artist) => void;
  onAdd: (fields: {
    name: string;
    genre: string;
    slot: string;
    spotify: string;
    soundcloud: string;
    instagram: string;
  }) => void;
};

export default function LineUp({ artists, adminOn, onRemove, onEditLinks, onAdd }: Props) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    if (!name) return;
    onAdd({
      name,
      genre: String(fd.get("genre") ?? "").trim() || "Mystère",
      slot: String(fd.get("slot") ?? "").trim() || "Horaire à venir",
      spotify: String(fd.get("spotify") ?? "").trim(),
      soundcloud: String(fd.get("soundcloud") ?? "").trim(),
      instagram: String(fd.get("instagram") ?? "").trim(),
    });
    form.reset();
  };

  return (
    <section id="lineup" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.headRow}>
          <h2 className={styles.title}>Les étapes</h2>
          <span className={styles.note}>(le parcours peut encore bouger, restez chauds)</span>
        </div>

        <div className={styles.grid} data-reveal="">
          {artists.length === 0 && (
            <div className={styles.card}>
              <div className={styles.name}>Programmation en cours…</div>
              <div className={styles.slot}>Le peloton s&apos;échauffe, reviens bientôt !</div>
            </div>
          )}
          {artists.map((artist, i) => {
            const links = LINK_DEFS.filter(({ key }) => artist[key]).map(({ key, label }) => ({
              label,
              url: artist[key] as string,
            }));
            return (
              <div key={artist.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.badges}>
                    {/* Dossard d'étape (déduit de la position, rien en base) */}
                    <span className={styles.stage}>Étape {i + 1}</span>
                    {/* Genre aux couleurs d'un maillot du Tour */}
                    <span
                      className={styles.tag}
                      style={MAILLOTS[i % MAILLOTS.length].style}
                      title={MAILLOTS[i % MAILLOTS.length].title}
                    >
                      {artist.genre}
                    </span>
                  </div>
                  {adminOn && (
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => onRemove(artist)}
                      aria-label={`Supprimer ${artist.name}`}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className={styles.name}>{artist.name}</div>
                <div className={styles.slot}>{artist.slot}</div>
                {links.length > 0 && (
                  <div className={styles.linksRow}>
                    {links.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.linkBadge}
                      >
                        {link.label} ↗
                      </a>
                    ))}
                  </div>
                )}
                {adminOn && (
                  <button
                    type="button"
                    className={styles.editLinksBtn}
                    onClick={() => onEditLinks(artist)}
                  >
                    🔗 Modifier les liens
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {adminOn && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.field}>
              Nom
              <input name="name" required placeholder="DJ Tracteur" className={styles.input} />
            </label>
            <label className={styles.field}>
              Genre
              <input name="genre" placeholder="Électro" className={styles.input} />
            </label>
            <label className={styles.field}>
              Horaire
              <input name="slot" placeholder="Samedi · 23h00" className={styles.input} />
            </label>
            <label className={styles.field}>
              Spotify
              <input
                name="spotify"
                placeholder="https://open.spotify.com/..."
                className={`${styles.input} ${styles.inputWide}`}
              />
            </label>
            <label className={styles.field}>
              SoundCloud
              <input
                name="soundcloud"
                placeholder="https://soundcloud.com/..."
                className={`${styles.input} ${styles.inputWide}`}
              />
            </label>
            <label className={styles.field}>
              Instagram
              <input
                name="instagram"
                placeholder="https://instagram.com/..."
                className={`${styles.input} ${styles.inputWide}`}
              />
            </label>
            <button type="submit" className={styles.submit}>
              + Ajouter l&apos;artiste
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
