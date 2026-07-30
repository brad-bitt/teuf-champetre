"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchFestivalData } from "@/lib/data";
import { getBrowserSupabase } from "@/lib/supabase";
import type { Artist, ArtistLinks, FestivalData, Photo, Settings } from "@/lib/types";
import AdminBanner from "./AdminBanner";
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

export default function FestivalSite({ initialData, demoMode }: Props) {
  const supabase = useMemo(() => getBrowserSupabase(), []);
  const [data, setData] = useState(initialData);
  const [adminOn, setAdminOn] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
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

  const addPhotos = useCallback(
    async (files: File[]) => {
      if (!supabase) return;
      setUploading(true);
      try {
        for (const file of files) {
          const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
          const path = `${crypto.randomUUID()}.${ext}`;
          const { error: upErr } = await supabase.storage.from("photos").upload(path, file);
          if (upErr) {
            alert(`Envoi de « ${file.name} » impossible : ${upErr.message}`);
            continue;
          }
          const { error: insErr } = await supabase
            .from("photos")
            .insert({ path, label: file.name });
          if (insErr) alert(`Enregistrement de « ${file.name} » impossible : ${insErr.message}`);
        }
      } finally {
        setUploading(false);
      }
      await refresh();
    },
    [supabase, refresh],
  );

  const removePhoto = useCallback(
    async (photo: Photo) => {
      if (!supabase || !confirm("Supprimer cette photo ?")) return;
      const { error } = await supabase.from("photos").delete().eq("id", photo.id);
      if (error) {
        alert("Suppression impossible : " + error.message);
      } else if (photo.path) {
        // Nettoie aussi le fichier du bucket (best effort)
        await supabase.storage.from("photos").remove([photo.path]);
      }
      await refresh();
    },
    [supabase, refresh],
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
      <Gallery
        photos={data.photos}
        adminOn={adminOn}
        uploading={uploading}
        onRemove={removePhoto}
        onAdd={addPhotos}
      />
      <Footer settings={data.settings} adminOn={adminOn} onAdminClick={handleAdminClick} />

      {adminOn && (
        <AdminBanner onOpenSettings={() => setSettingsOpen(true)} onSignOut={signOut} />
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
    </div>
  );
}
