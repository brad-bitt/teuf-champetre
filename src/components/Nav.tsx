import styles from "./Nav.module.css";

export default function Nav({ billetterieUrl }: { billetterieUrl: string }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>Teuf Champêtre</div>
      <div className={styles.links}>
        <a href="#lineup" className={styles.link}>
          Programmation
        </a>
        <a href="#galerie" className={styles.link}>
          Photos
        </a>
        <a href={billetterieUrl} target="_blank" rel="noreferrer" className={styles.ticket}>
          Billetterie ↗
        </a>
      </div>
    </nav>
  );
}
