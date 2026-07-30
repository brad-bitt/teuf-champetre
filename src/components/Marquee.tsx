import styles from "./Marquee.module.css";

const TEXT =
  "Vélo ★ Maillot jaune ★ Électro ★ Flamme rouge ★ Peloton ★ Rock ★ Échappée ★ Pop ★ Lanterne rouge ★ Teuf ★ Col de la Grange ★ ";

type Props = {
  /** Texte de la boucle (l'espace insécable final évite que la jonction colle). */
  text?: string;
  /** Couleur du texte — par défaut le rose de la maquette. */
  color?: string;
  /** Défile vers la droite au lieu de la gauche (pour alterner entre sections). */
  reverse?: boolean;
};

export default function Marquee({ text = TEXT, color, reverse = false }: Props) {
  return (
    <div className={styles.bar}>
      <div
        className={reverse ? `${styles.track} ${styles.reverse}` : styles.track}
        style={color ? { color } : undefined}
      >
        <span className={styles.text}>{text}</span>
        <span className={styles.text} aria-hidden="true">
          {text}
        </span>
      </div>
    </div>
  );
}
