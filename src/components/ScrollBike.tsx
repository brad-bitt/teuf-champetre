"use client";

import { useEffect, useRef } from "react";
import { SCROLL_RIDER } from "@/lib/deco";
import styles from "./ScrollBike.module.css";

/**
 * Le cycliste qui roule sur la bordure basse de la nav : sa position suit la
 * progression de lecture (haut de page → départ, footer → ligne d'arrivée).
 * Purement décoratif — aria-hidden, aucune interaction.
 */
export default function ScrollBike() {
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      track.style.setProperty("--p", String(p));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={trackRef} className={styles.track} aria-hidden="true">
      <span className={styles.bike}>{SCROLL_RIDER}</span>
    </div>
  );
}
