"use client";

import { useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import styles from "./Modal.module.css";

type Props = {
  supabase: SupabaseClient | null;
  demoMode: boolean;
  onClose: () => void;
};

export default function LoginModal({ supabase, demoMode, onClose }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signInWithPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase) return;
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
    });
    setBusy(false);
    // Si succès : l'écouteur onAuthStateChange (FestivalSite) ferme la modale
    // et active le mode admin.
    if (error) setError("Connexion impossible : " + error.message);
  };

  const signInWithGoogle = async () => {
    if (!supabase) return;
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setError("Google : " + error.message);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Espace admin</h3>

        {demoMode ? (
          <>
            <p className={styles.subtitle}>
              Le site tourne en <strong>mode démo</strong> : Supabase n&apos;est pas encore
              configuré, le back-office est donc désactivé. Suis le guide du README (copie{" "}
              <code>.env.example</code> vers <code>.env.local</code> et remplis les clés) pour
              l&apos;activer.
            </p>
            <div className={styles.actions}>
              <button type="button" className={styles.ghostBtn} onClick={onClose}>
                Fermer
              </button>
            </div>
          </>
        ) : (
          <>
            <p className={styles.subtitle}>
              Réservé à l&apos;équipe de la Teuf — connecte-toi pour gérer la programmation, les
              photos et les infos.
            </p>

            <button type="button" className={styles.googleBtn} onClick={signInWithGoogle}>
              <GoogleIcon /> Continuer avec Google
            </button>

            <div className={styles.divider}>ou par email</div>

            <form
              onSubmit={signInWithPassword}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <label className={styles.field}>
                Email
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={styles.input}
                />
              </label>
              <label className={styles.field}>
                Mot de passe
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className={styles.input}
                />
              </label>
              {error && <div className={styles.error}>{error}</div>}
              <div className={styles.actions}>
                <button type="submit" disabled={busy} className={styles.primaryBtn}>
                  {busy ? "Connexion…" : "Se connecter"}
                </button>
                <button type="button" className={styles.ghostBtn} onClick={onClose}>
                  Annuler
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
