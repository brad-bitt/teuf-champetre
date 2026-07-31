"use client";

import type { FormEvent } from "react";
import {
  DAY_COLORS,
  FESTIVAL_DAYS,
  LINK_DEFS,
  MAILLOTS,
  parseSlotDay,
  slotMinutes,
  slotWithoutDay,
  type Artist,
} from "@/lib/types";
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

/** Fonds des cartes, en rotation — tout sauf le jaune de la section. */
const CARD_BGS = ["var(--cream)", "var(--blue)", "var(--pink)", "var(--green)"];

export default function LineUp({ artists, adminOn, onRemove, onEditLinks, onAdd }: Props) {
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
      genre: String(fd.get("genre") ?? "").trim() || "Mystère",
      // Le jour vit dans le créneau : « Samedi · 23h30 » (aucune migration)
      slot: `${day} · ${time || "Horaire à venir"}`,
      spotify: String(fd.get("spotify") ?? "").trim(),
      soundcloud: String(fd.get("soundcloud") ?? "").trim(),
      instagram: String(fd.get("instagram") ?? "").trim(),
    });
    form.reset();
  };

  // Regroupe par jour ; les créneaux sans jour reconnu vont dans « Jour mystère »
  const groups = FESTIVAL_DAYS.map((day) => ({
    day,
    color: DAY_COLORS[day],
    // Tri chronologique dans le jour (tri stable : à horaire égal, l'ordre admin)
    list: artists
      .filter((a) => parseSlotDay(a.slot) === day)
      .sort((a, b) => slotMinutes(a.slot) - slotMinutes(b.slot)),
  }));
  const unscheduled = artists.filter((a) => parseSlotDay(a.slot) === null);

  // « Étape N » continue à travers les jours, comme le vrai Tour
  const ordered = [...groups.flatMap((g) => g.list), ...unscheduled];
  const stageOf = new Map(ordered.map((a, i) => [a.id, i]));

  const renderCard = (artist: Artist) => {
    const i = stageOf.get(artist.id) ?? 0;
    const links = LINK_DEFS.filter(({ key }) => artist[key]).map(({ key, label }) => ({
      label,
      url: artist[key] as string,
    }));
    const maillot = MAILLOTS[i % MAILLOTS.length];
    return (
      <div key={artist.id} className={styles.card} style={{ background: CARD_BGS[i % CARD_BGS.length] }}>
        <div className={styles.cardTop}>
          <div className={styles.badges}>
            {/* Dossard d'étape (déduit de la position, rien en base) */}
            <span className={styles.stage}>Étape {i + 1}</span>
            {/* Genre aux couleurs d'un maillot du Tour */}
            <span className={styles.tag} style={maillot.style} title={maillot.title}>
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
        <div className={styles.slot}>{slotWithoutDay(artist.slot)}</div>
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
  };

  return (
    <section id="lineup" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.headRow}>
          <h2 className={styles.title}>Les étapes</h2>
          <span className={styles.note}>(le parcours peut encore bouger, restez chauds)</span>
        </div>

        {artists.length === 0 ? (
          <div className={styles.grid} data-reveal="">
            <div className={styles.card} style={{ background: CARD_BGS[0] }}>
              <div className={styles.name}>Programmation en cours…</div>
              <div className={styles.slot}>Le peloton s&apos;échauffe, reviens bientôt !</div>
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
                        Rien de calé ce jour-là pour l&apos;instant — ajoute un artiste
                        ci-dessous.
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
              <input name="name" required placeholder="DJ Tracteur" className={styles.input} />
            </label>
            <label className={styles.field}>
              Genre
              <input name="genre" placeholder="Électro" className={styles.input} />
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
              <input name="time" placeholder="23h00" className={styles.input} />
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
