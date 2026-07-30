"use client";

import styles from "./AdminBanner.module.css";

type Props = {
  onOpenSettings: () => void;
  onSignOut: () => void;
};

export default function AdminBanner({ onOpenSettings, onSignOut }: Props) {
  return (
    <div className={styles.banner}>
      <span>🔧 Mode admin actif — ajoute / supprime photos et artistes</span>
      <button type="button" className={styles.btn} onClick={onOpenSettings}>
        ⚙️ Infos du site
      </button>
      <button type="button" className={styles.btn} onClick={onSignOut}>
        Se déconnecter
      </button>
    </div>
  );
}
