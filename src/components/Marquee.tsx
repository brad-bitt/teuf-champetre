import styles from "./Marquee.module.css";

const TEXT = "Vélo ★ Maillot jaune ★ Électro ★ Peloton ★ Rock ★ Échappée ★ Pop ★ Teuf ★ ";

export default function Marquee() {
  return (
    <div className={styles.bar}>
      <div className={styles.track}>
        <span className={styles.text}>{TEXT}</span>
        <span className={styles.text} aria-hidden="true">
          {TEXT}
        </span>
      </div>
    </div>
  );
}
