"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchFestivalData } from "@/lib/data";
import { getBrowserSupabase } from "@/lib/supabase";
import type { Activity, Artist, ArtistLinks, FestivalData, Photo, Settings } from "@/lib/types";
import Activities from "./Activities";
import AdminBanner from "./AdminBanner";
import AdminsModal from "./AdminsModal";
import EditLinksModal from "./EditLinksModal";
import Footer from "./Footer";
import Gallery from "./Gallery";
import Hero from "./Hero";
import LineUp from "./LineUp";
import LoginModal from "./LoginModal";
import Marquee from "./Marquee";
import Nav from "./Nav";
import SettingsModal from "./SettingsModal";

type Props = {
  initialData: FestivalData;
  demoMode: boolean;
};

/** Garde-fou côté navigateur : évite d'envoyer une vidéo ou un RAW de 80 Mo. */
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export default function FestivalSite({ initialData, demoMode }: Props) {
  const supabase = useMemo(() => getBrowserSupabase(), []);
  const [data, setData] = useState(initialData);
  const [adminOn, setAdminOn] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminsOpen, setAdminsOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [uploading, setUploading] = useState(false);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    try {
      setData(await fetchFestivalData(supabase));
    } catch (e) {
      console.error(e);
    }
  }, [supabase]);

  // Révélation au scroll : les grilles marquées data-reveal passent à "in"
  // quand elles entrent à l'écran (styles dans globals.css). Le marqueur
  // html[data-motion] garantit que sans JS, rien n'est jamais masqué.
  useEffect(() => {
    document.documentElement.dataset.motion = "on";
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-reveal", "in");
            observer.unobserve(entry.target);
          }
        }
      },
      // Déclenche un peu avant que la grille soit vraiment visible
      { rootMargin: "0px 0px -10% 0px" },
    );
    document
      .querySelectorAll('[data-reveal]:not([data-reveal="in"])')
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [data]);

  // Connexion : quand une session apparaît (mot de passe ou retour OAuth Google),
  // on vérifie les droits admin ; sans droits, on déconnecte immédiatement.
  useEffect(() => {
    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        void (async () => {
          const { data: isAdmin, error } = await supabase.rpc("is_admin");
          if (error) {
            console.error(error);
            return;
          }
          if (isAdmin) {
            setAdminOn(true);
            setLoginOpen(false);
          } else {
            alert(
              "Ce compte est bien connecté mais n'est pas admin.\n" +
                "Ajoute son email dans la table « admins » de Supabase (voir README).",
            );
            await supabase.auth.signOut();
          }
        })();
      }
      if (event === "SIGNED_OUT") setAdminOn(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  // Clic sur le bouton « Admin » du footer : le login n'apparaît qu'ici.
  const handleAdminClick = useCallback(async () => {
    if (adminOn) {
      setAdminOn(false);
      return;
    }
    if (!supabase) {
      setLoginOpen(true); // mode démo : la modale explique la marche à suivre
      return;
    }
    // Session déjà ouverte (ex. retour sur le site) ⇒ pas de re-login
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      const { data: isAdmin } = await supabase.rpc("is_admin");
      if (isAdmin) {
        setAdminOn(true);
        return;
      }
    }
    setLoginOpen(true);
  }, [adminOn, supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, [supabase]);

  // ——— Actions admin (protégées côté base par les politiques RLS) ———

  const addArtist = useCallback(
    async (fields: {
      name: string;
      genre: string;
      slot: string;
      spotify: string;
      soundcloud: string;
      instagram: string;
    }) => {
      if (!supabase) return;
      const { error } = await supabase.from("artists").insert({
        name: fields.name,
        genre: fields.genre,
        slot: fields.slot,
        spotify: fields.spotify || null,
        soundcloud: fields.soundcloud || null,
        instagram: fields.instagram || null,
        position: data.artists.length,
      });
      if (error) alert("Ajout impossible : " + error.message);
      await refresh();
    },
    [supabase, data.artists.length, refresh],
  );

  const removeArtist = useCallback(
    async (artist: Artist) => {
      if (!supabase || !confirm(`Supprimer ${artist.name} de la programmation ?`)) return;
      const { error } = await supabase.from("artists").delete().eq("id", artist.id);
      if (error) alert("Suppression impossible : " + error.message);
      await refresh();
    },
    [supabase, refresh],
  );

  const addActivity = useCallback(
    async (fields: { name: string; slot: string; place: string }) => {
      if (!supabase) return;
      const { error } = await supabase.from("activities").insert({
        name: fields.name,
        slot: fields.slot,
        place: fields.place,
        position: data.activities.length,
      });
      if (error) alert("Ajout impossible : " + error.message);
      await refresh();
    },
    [supabase, data.activities.length, refresh],
  );

  const removeActivity = useCallback(
    async (activity: Activity) => {
      if (!supabase || !confirm(`Supprimer ${activity.name} du programme ?`)) return;
      const { error } = await supabase.from("activities").delete().eq("id", activity.id);
      if (error) alert("Suppression impossible : " + error.message);
      await refresh();
    },
    [supabase, refresh],
  );

  const saveLinks = useCallback(
    async (artist: Artist, links: ArtistLinks) => {
      if (!supabase) return;
      const { error } = await supabase.from("artists").update(links).eq("id", artist.id);
      if (error) alert("Mise à jour impossible : " + error.message);
      setEditingArtist(null);
      await refresh();
    },
    [supabase, refresh],
  );

  /** Jeton de session pour authentifier les appels aux routes API. */
  const getAccessToken = useCallback(async () => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, [supabase]);

  const addPhotos = useCallback(
    async (files: File[]) => {
      if (!supabase) return;
      setUploading(true);
      try {
        const token = await getAccessToken();
        if (!token) {
          alert("Session expirée — reconnecte-toi.");
          return;
        }
        // 1. Signature d'upload délivrée par notre API (admins uniquement)
        const sigRes = await fetch("/api/photos/sign-upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!sigRes.ok) {
          const body = await sigRes.json().catch(() => null);
          alert(body?.error ?? "Impossible de préparer l'envoi des photos.");
          return;
        }
        const sig = await sigRes.json();

        // 2. Upload direct navigateur → Cloudinary (le fichier ne passe pas par notre serveur)
        let nextPosition = data.photos.length;
        for (const file of files) {
          if (!file.type.startsWith("image/")) {
            alert(`« ${file.name} » n'est pas une image.`);
            continue;
          }
          if (file.size > MAX_PHOTO_BYTES) {
            alert(
              `« ${file.name} » dépasse ${MAX_PHOTO_BYTES / 1024 / 1024} Mo — compresse-la avant.`,
            );
            continue;
          }
          const fd = new FormData();
          fd.append("file", file);
          fd.append("api_key", sig.apiKey);
          fd.append("timestamp", String(sig.timestamp));
          fd.append("folder", sig.folder);
          // Signé côté serveur : doit être renvoyé à l'identique
          fd.append("allowed_formats", sig.allowedFormats);
          fd.append("signature", sig.signature);
          const upRes = await fetch(
            `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
            { method: "POST", body: fd },
          );
          if (!upRes.ok) {
            alert(`Envoi de « ${file.name} » impossible.`);
            continue;
          }
          const uploaded = await upRes.json();

          // 3. Référence en base (protégée par RLS), à la suite des photos existantes
          const { error } = await supabase
            .from("photos")
            .insert({ public_id: uploaded.public_id, label: file.name, position: nextPosition });
          if (error) alert(`Enregistrement de « ${file.name} » impossible : ${error.message}`);
          else nextPosition += 1;
        }
      } finally {
        setUploading(false);
      }
      await refresh();
    },
    [supabase, getAccessToken, refresh, data.photos.length],
  );

  const removePhoto = useCallback(
    async (photo: Photo) => {
      if (!supabase || !confirm("Supprimer cette photo ?")) return;
      const token = await getAccessToken();
      if (!token) {
        alert("Session expirée — reconnecte-toi.");
        return;
      }
      const res = await fetch("/api/photos/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: photo.id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        alert(body?.error ?? "Suppression impossible.");
      }
      await refresh();
    },
    [supabase, getAccessToken, refresh],
  );

  const renamePhoto = useCallback(
    async (photo: Photo, label: string) => {
      if (!supabase) return;
      const { error } = await supabase.from("photos").update({ label }).eq("id", photo.id);
      if (error) alert("Renommage impossible : " + error.message);
      await refresh();
    },
    [supabase, refresh],
  );

  /** Reclasse une photo (drag & drop ou flèches) : affichage immédiat, persistance ensuite. */
  const movePhoto = useCallback(
    async (from: number, to: number) => {
      if (!supabase || from === to) return;
      const photos = [...data.photos];
      if (from < 0 || to < 0 || from >= photos.length || to >= photos.length) return;
      const [moved] = photos.splice(from, 1);
      photos.splice(to, 0, moved);
      setData({ ...data, photos });

      const results = await Promise.all(
        photos.map((p, i) =>
          p.position !== i
            ? supabase.from("photos").update({ position: i }).eq("id", p.id)
            : null,
        ),
      );
      const failed = results.find((r) => r?.error);
      if (failed?.error) {
        alert(
          `Réorganisation impossible : ${failed.error.message}` +
            " (la migration 0004_photo_positions a-t-elle été exécutée dans Supabase ?)",
        );
      }
      await refresh();
    },
    [supabase, data, refresh],
  );

  const saveSettings = useCallback(
    async (settings: Settings) => {
      if (!supabase) return;
      const { error } = await supabase.from("settings").upsert({ id: 1, ...settings });
      if (error) alert("Enregistrement impossible : " + error.message);
      setSettingsOpen(false);
      await refresh();
    },
    [supabase, refresh],
  );

  return (
    <div>
      <Nav billetterieUrl={data.settings.billetterie_url} />
      <Hero settings={data.settings} />
      <Marquee />
      <LineUp
        artists={data.artists}
        adminOn={adminOn}
        onRemove={removeArtist}
        onEditLinks={setEditingArtist}
        onAdd={addArtist}
      />
      <Marquee
        text={"Bingo ★ Loto ★ Pétanque ★ Ravitaillement ★ Chasse au trésor ★ Buvette ★ Zone de récup ★ "}
        color="var(--blue)"
        reverse
      />
      <Activities
        activities={data.activities}
        adminOn={adminOn}
        onRemove={removeActivity}
        onAdd={addActivity}
      />
      <Marquee
        text={"Flash ★ Pogo ★ Golden hour ★ Souvenirs ★ Confettis ★ Pellicule ★ Photo finish ★ "}
        color="var(--green)"
      />
      <Gallery
        photos={data.photos}
        adminOn={adminOn}
        uploading={uploading}
        onRemove={removePhoto}
        onAdd={addPhotos}
        onMove={movePhoto}
        onRename={renamePhoto}
      />
      <Footer settings={data.settings} adminOn={adminOn} onAdminClick={handleAdminClick} />

      {adminOn && (
        <AdminBanner
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenAdmins={() => setAdminsOpen(true)}
          onSignOut={signOut}
        />
      )}
      {loginOpen && (
        <LoginModal supabase={supabase} demoMode={demoMode} onClose={() => setLoginOpen(false)} />
      )}
      {settingsOpen && (
        <SettingsModal
          settings={data.settings}
          onSave={saveSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
      {editingArtist && (
        <EditLinksModal
          artist={editingArtist}
          onSave={saveLinks}
          onClose={() => setEditingArtist(null)}
        />
      )}
      {adminsOpen && supabase && (
        <AdminsModal supabase={supabase} onClose={() => setAdminsOpen(false)} />
      )}
    </div>
  );
}
