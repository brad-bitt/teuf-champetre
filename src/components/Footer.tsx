"use client";

import type { Settings } from "@/lib/types";
import styles from "./Footer.module.css";

type Props = {
  settings: Settings;
  adminOn: boolean;
  onAdminClick: () => void;
};

export default function Footer({ settings, adminOn, onAdminClick }: Props) {
  return (
    <footer className={styles.footer}>
      {/* La ligne d'arrivée, forcément en damier — et sa flamme rouge */}
      <div className={styles.finishLine} aria-hidden="true" />
      <div
        className={styles.flammeRouge}
        aria-hidden="true"
        title="Flamme rouge — dernier kilomètre !"
      />
      <div className={styles.inner}>
        <div className={styles.topRow}>
          <div className={styles.bigText}>On se voit sur la ligne d&apos;arrivée ?</div>
          <a
            href={settings.billetterie_url}
            target="_blank"
            rel="noreferrer"
            className={styles.ticketBtn}
          >
            Billetterie ↗
          </a>
        </div>
        <div className={styles.bottomRow}>
          <span>
            Teuf Champêtre · {settings.edition} · {settings.lieu}
          </span>
          <div className={styles.actions}>
            <button
              type="button"
              onClick={onAdminClick}
              className={adminOn ? styles.adminBtnOn : styles.adminBtn}
            >
              {adminOn ? "Quitter le mode admin" : "Admin"}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
