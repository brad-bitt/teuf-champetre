import styles from "./DiscoBall.module.css";

/**
 * La boule disco pendue au plafond : cachée au-dessus de l'écran, elle
 * descend quand le mode fête s'allume (styles pilotés par html[data-fete]).
 */
export default function DiscoBall() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <div className={styles.pendulum}>
        <div className={styles.string} />
        <div className={styles.ball}>🪩</div>
      </div>
    </div>
  );
}
