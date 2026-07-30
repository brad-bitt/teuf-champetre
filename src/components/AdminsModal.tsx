"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import modalStyles from "./Modal.module.css";
import styles from "./AdminsModal.module.css";

type Props = {
  supabase: SupabaseClient;
  onClose: () => void;
};

export default function AdminsModal({ supabase, onClose }: Props) {
  const [admins, setAdmins] = useState<string[] | null>(null);
  const [selfEmail, setSelfEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [{ data: userData }, { data, error }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("admins").select("email").order("email"),
    ]);
    setSelfEmail(userData.user?.email?.toLowerCase() ?? null);
    if (error) {
      setError(error.message);
      return;
    }
    setAdmins((data ?? []).map((row) => row.email));
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    if (!email) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.from("admins").insert({ email });
    setBusy(false);
    if (error) {
      setError("Ajout impossible : " + error.message);
      return;
    }
    form.reset();
    await load();
  };

  const handleRemove = async (email: string) => {
    if (!confirm(`Retirer les droits admin de ${email} ?`)) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.from("admins").delete().eq("email", email);
    setBusy(false);
    if (error) {
      setError("Suppression impossible : " + error.message);
      return;
    }
    await load();
  };

  return (
    <div className={modalStyles.overlay} onClick={onClose}>
      <div className={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={modalStyles.title}>👥 Admins</h3>
        <p className={modalStyles.subtitle}>
          Seuls ces emails peuvent se connecter en mode admin (Google ou email/mot de passe).
        </p>

        {admins === null ? (
          <p className={modalStyles.subtitle}>Chargement…</p>
        ) : (
          <div className={styles.list}>
            {admins.map((email) => (
              <div key={email} className={styles.row}>
                <span className={styles.email}>
                  {email}
                  {email === selfEmail && <span className={styles.selfBadge}>Toi</span>}
                </span>
                <button
                  type="button"
                  className={styles.removeBtn}
                  disabled={busy || admins.length <= 1}
                  title={admins.length <= 1 ? "Impossible de retirer le dernier admin" : undefined}
                  onClick={() => handleRemove(email)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <div className={modalStyles.error}>{error}</div>}

        <form onSubmit={handleAdd} className={styles.addRow}>
          <label className={`${modalStyles.field} ${styles.field}`}>
            Ajouter un email
            <input
              name="email"
              type="email"
              required
              placeholder="ami@gmail.com"
              className={modalStyles.input}
            />
          </label>
          <button type="submit" disabled={busy} className={modalStyles.primaryBtn}>
            + Ajouter
          </button>
        </form>

        <div className={modalStyles.actions}>
          <button type="button" className={modalStyles.ghostBtn} onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
