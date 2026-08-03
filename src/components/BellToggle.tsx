"use client";

import { useEffect, useRef, useState } from "react";
import { announceTeuf } from "@/lib/announce";
import styles from "./BellToggle.module.css";

const STORAGE_KEY = "teuf-sonnette";

/**
 * L'annonce « TEUF CHAMPÊTRE ! » qui claque à chaque clic sur le site, avec
 * son interrupteur 📣/🔇 (choix mémorisé dans le navigateur). Le React onClick
 * du bouton s'exécute avant l'écouteur global (attaché à window) : couper le
 * son ne crie donc pas, le réactiver crie en guise de confirmation.
 */
export default function BellToggle() {
  const [enabled, setEnabled] = useState(true);
  const enabledRef = useRef(true);

  // Préférence sauvegardée — lue après montage, le serveur n'a pas de localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const on = saved === "on";
      setEnabled(on);
      enabledRef.current = on;
    }
  }, []);

  useEffect(() => {
    const onClick = () => {
      if (enabledRef.current) announceTeuf();
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    enabledRef.current = next;
    localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
  };

  return (
    <button
      type="button"
      className={styles.btn}
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Couper l'annonce au clic" : "Réactiver l'annonce au clic"}
      title={enabled ? "« Teuf Champêtre ! » au clic : activé" : "« Teuf Champêtre ! » au clic : coupé"}
    >
      {enabled ? "📣" : "🔇"}
    </button>
  );
}
