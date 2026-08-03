import type { Settings } from "@/lib/types";
import Countdown from "./Countdown";
import styles from "./Hero.module.css";

export default function Hero({ settings }: { settings: Settings }) {
  return (
    <header className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.badge}>
          {settings.edition} · {settings.dates} · 🚴 Thème vélo
        </div>
        <h1 className={styles.title}>
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
          <div className={styles.place}>📍 {settings.lieu}</div>
        </div>
      </div>
      <div className={styles.polka} title="maillot à pois" />
      <div className={styles.sun} />
      <div className={styles.bike}>🚴</div>
    </header>
  );
}
