"use client";

import { useEffect, useRef, useState } from "react";
import { ringBell } from "@/lib/bell";
import styles from "./BellToggle.module.css";

const STORAGE_KEY = "teuf-sonnette";

/**
 * La sonnette de vélo qui « dring » à chaque clic sur le site, avec son
 * interrupteur 🔔/🔕 (choix mémorisé dans le navigateur). Le React onClick du
 * bouton s'exécute avant l'écouteur global (attaché à window) : couper la
 * sonnette ne sonne donc pas, la réactiver sonne en guise de confirmation.
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
      if (enabledRef.current) ringBell();
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
      aria-label={enabled ? "Couper la sonnette au clic" : "Réactiver la sonnette au clic"}
      title={enabled ? "Sonnette au clic : activée" : "Sonnette au clic : coupée"}
    >
      {enabled ? "🔔" : "🔕"}
    </button>
  );
}
