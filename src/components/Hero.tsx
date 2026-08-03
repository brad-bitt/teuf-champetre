"use client";

import { useEffect, useState } from "react";
import { burstConfetti } from "@/lib/confetti";
import { initFeteMode, isFeteMode, toggleFeteMode } from "@/lib/fete";
import type { Settings } from "@/lib/types";
import Countdown from "./Countdown";
import styles from "./Hero.module.css";

export default function Hero({ settings }: { settings: Settings }) {
  const [feteOn, setFeteOn] = useState(false);

  // Restaure le mode fête mémorisé (après montage : pas de localStorage côté serveur)
  useEffect(() => {
    initFeteMode();
    setFeteOn(isFeteMode());
  }, []);

  return (
    <header className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.badge}>
          {settings.edition} · {settings.dates} · 🚴 Thème vélo
        </div>
        {/* Le titre allume/éteint le mode fête — confettis à l'allumage */}
        <h1
          className={styles.title}
          onClick={(e) => {
            const on = toggleFeteMode();
            setFeteOn(on);
            if (on) burstConfetti(e.clientX, e.clientY);
          }}
          title={feteOn ? "Rallumer les lumières ☀️" : "Éteindre les lumières, que la teuf commence ! 🌙"}
        >
          Teuf
          <br />
          Champêtre
        </h1>
        <p className={styles.lede}>
          Cette année on enfile le maillot : la Teuf passe en mode Tour de France. Électro qui
          tape, rock qui transpire, pop qui colle — et un peloton de copains dans un champ.
        </p>
        <Countdown target={settings.event_start} />
        <div className={styles.ctaRow}>
          <a
            href={settings.billetterie_url}
            target="_blank"
            rel="noreferrer"
            className={styles.cta}
          >
            Rejoindre le peloton ↗
          </a>
          {settings.don_url && (
            <a
              href={settings.don_url}
              target="_blank"
              rel="noreferrer"
              className={styles.ctaDon}
            >
              💛 Faire un don
            </a>
          )}
          <div className={styles.place}>📍 {settings.lieu}</div>
        </div>
      </div>
      <div className={styles.polka} title="maillot à pois" />
      <div className={styles.sun} />
      <div className={styles.bike}>🚴</div>
    </header>
  );
}
