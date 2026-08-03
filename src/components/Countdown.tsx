"use client";

import { useEffect, useState } from "react";
import styles from "./Countdown.module.css";

/**
 * Compte à rebours du hero, façon départ d'étape. Rendu uniquement après mount
 * (l'heure du visiteur n'existe pas au rendu serveur — évite tout mismatch
 * d'hydratation) ; rien ne s'affiche tant que `target` est absent (migration
 * 0005 pas encore passée ou date non renseignée).
 */
export default function Countdown({ target }: { target: string | null | undefined }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!target) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [target]);

  if (!target || now === null) return null;
  const start = new Date(target).getTime();
  if (Number.isNaN(start)) return null;

  const remaining = start - now;
  if (remaining <= 0) {
    return <div className={styles.badge}>🚴 C&apos;est parti ! Le peloton est lancé !</div>;
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor(remaining / 3_600_000) % 24;
  const minutes = Math.floor(remaining / 60_000) % 60;
  const seconds = Math.floor(remaining / 1000) % 60;

  return (
    <div className={styles.badge}>
      🚴 Départ dans
      <span className={styles.unit}>
        J-{days}
      </span>
      <span className={styles.time}>
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </span>
    </div>
  );
}
