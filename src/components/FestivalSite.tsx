"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchFestivalData } from "@/lib/data";
import { SECTION_STICKERS } from "@/lib/deco";
import { getBrowserSupabase } from "@/lib/supabase";
import {
  parseSectionOrder,
  type Activity,
  type Artist,
  type FestivalData,
  type Info,
  type Photo,
  type SectionKey,
  type Settings,
} from "@/lib/types";
import Activities from "./Activities";
import AdminBanner from "./AdminBanner";
import EditActivityModal, { type ActivityFields } from "./EditActivityModal";
import EditArtistModal, { type ArtistFields } from "./EditArtistModal";
import EditInfoModal, { type InfoFields } from "./EditInfoModal";
import AdminsModal from "./AdminsModal";
import Footer from "./Footer";
import Gallery from "./Gallery";
import Hero from "./Hero";
import InfosPratiques from "./InfosPratiques";
import LineUp from "./LineUp";
import LoginModal from "./LoginModal";
import Marquee from "./Marquee";
import BellToggle from "./BellToggle";
import Nav from "./Nav";
import ScrollBike from "./ScrollBike";
import SettingsModal from "./SettingsModal";
import sectionStyles from "./SectionOrder.module.css";

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
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingInfo, setEditingInfo] = useState<Info | null>(null);
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

  // Les pastilles fuient la souris — et la poussée s'ACCUMULE : pas de retour
  // élastique, on peut les balader n'importe où sur le site en les chassant.
  // Une seule écoute mousemove (rAF). Coupé sans souris (tactile) et si
  // l'utilisateur réduit les animations.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const RADIUS = 150; // distance à laquelle la souris commence à pousser
    const KICK = 3.2; // impulsion max ajoutée à la vitesse par frame de souris
    const FRICTION = 0.955; // glisse : la vitesse s'éteint doucement
    const BOUNCE = 0.8; // énergie conservée en rebondissant sur une paroi
    // Centre de repos en coordonnées document, capturé au premier passage
    // (offset nul à ce moment-là) : aucune mesure faussée ensuite.
    type Ball = { el: HTMLElement; baseX: number; baseY: number; x: number; y: number; vx: number; vy: number };
    let balls: Ball[] | null = null;
    let mx = -10_000;
    let my = -10_000;
    let raf = 0;

    const collect = () => {
      balls = [...document.querySelectorAll<HTMLElement>("[data-dodge]")].map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          el,
          baseX: rect.left + rect.width / 2 + window.scrollX,
          baseY: rect.top + rect.height / 2 + window.scrollY,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
        };
      });
    };

    const frame = () => {
      raf = 0;
      // (Re)capture si premier passage ou si React a re-rendu les sections
      if (!balls || balls.some((b) => !b.el.isConnected)) collect();
      let moving = false;
      for (const b of balls!) {
        const half = b.el.offsetWidth / 2;
        // Position actuelle du centre, dans le viewport et dans le document
        const cx = b.baseX + b.x - window.scrollX;
        const cy = b.baseY + b.y - window.scrollY;

        // Poussée de la souris → gain de vitesse (et pas simple déplacement)
        const dx = cx - mx;
        const dy = cy - my;
        const dist = Math.hypot(dx, dy);
        if (dist > 0 && dist < RADIUS) {
          const kick = ((RADIUS - dist) / RADIUS) * KICK;
          b.vx += (dx / dist) * kick;
          b.vy += (dy / dist) * kick;
        }

        b.vx *= FRICTION;
        b.vy *= FRICTION;
        if (Math.abs(b.vx) < 0.05 && Math.abs(b.vy) < 0.05) continue;
        moving = true;
        b.x += b.vx;
        b.y += b.vy;

        // Rebonds sur les parois : bords gauche/droit de l'écran,
        // haut et bas du document
        const newCx = b.baseX + b.x;
        if (newCx - half < 4) {
          b.x = half + 4 - b.baseX;
          b.vx = Math.abs(b.vx) * BOUNCE;
        } else if (newCx + half > window.innerWidth - 4) {
          b.x = window.innerWidth - half - 4 - b.baseX;
          b.vx = -Math.abs(b.vx) * BOUNCE;
        }
        const docH = document.documentElement.scrollHeight;
        const newCy = b.baseY + b.y;
        if (newCy - half < 4) {
          b.y = half + 4 - b.baseY;
          b.vy = Math.abs(b.vy) * BOUNCE;
        } else if (newCy + half > docH - 4) {
          b.y = docH - half - 4 - b.baseY;
          b.vy = -Math.abs(b.vy) * BOUNCE;
        }
        b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
      }
      // La boucle continue tant qu'une pastille glisse encore
      if (moving && !raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    // Au redimensionnement, les positions en % bougent : on repart de zéro
    const onResize = () => {
      balls?.forEach((b) => (b.el.style.transform = ""));
      balls = null;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

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

  const addInfo = useCallback(
    async (fields: { emoji: string; title: string; body: string }) => {
      if (!supabase) return;
      const { error } = await supabase.from("infos").insert({
        emoji: fields.emoji,
        title: fields.title,
        body: fields.body,
        position: data.infos.length,
      });
      if (error) {
        alert(
          "Ajout impossible : " + error.message +
            " (la migration 0006_infos_countdown a-t-elle été exécutée dans Supabase ?)",
        );
      }
      await refresh();
    },
    [supabase, data.infos.length, refresh],
  );

  const removeInfo = useCallback(
    async (info: Info) => {
      if (!supabase || !confirm(`Supprimer l'info « ${info.title} » ?`)) return;
      const { error } = await supabase.from("infos").delete().eq("id", info.id);
      if (error) alert("Suppression impossible : " + error.message);
      await refresh();
    },
    [supabase, refresh],
  );

  const saveInfo = useCallback(
    async (info: Info, fields: InfoFields) => {
      if (!supabase) return;
      const { error } = await supabase.from("infos").update(fields).eq("id", info.id);
      if (error) alert("Mise à jour impossible : " + error.message);
      setEditingInfo(null);
      await refresh();
    },
    [supabase, refresh],
  );

  const saveArtist = useCallback(
    async (artist: Artist, fields: ArtistFields) => {
      if (!supabase) return;
      const { error } = await supabase.from("artists").update(fields).eq("id", artist.id);
      if (error) alert("Mise à jour impossible : " + error.message);
      setEditingArtist(null);
      await refresh();
    },
    [supabase, refresh],
  );

  const saveActivity = useCallback(
    async (activity: Activity, fields: ActivityFields) => {
      if (!supabase) return;
      const { error } = await supabase.from("activities").update(fields).eq("id", activity.id);
      if (error) alert("Mise à jour impossible : " + error.message);
      setEditingActivity(null);
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
      if (error) {
        alert(
          "Enregistrement impossible : " + error.message +
            " (la migration 0006_infos_countdown a-t-elle été exécutée dans Supabase ?)",
        );
      }
      setSettingsOpen(false);
      await refresh();
    },
    [supabase, refresh],
  );

  const sectionOrder = parseSectionOrder(data.settings.section_order);

  /** Monte/descend une section : affichage immédiat, persistance ensuite. */
  const moveSection = useCallback(
    async (from: number, to: number) => {
      if (!supabase || to < 0 || to >= sectionOrder.length) return;
      const order = [...sectionOrder];
      const [moved] = order.splice(from, 1);
      order.splice(to, 0, moved);
      const joined = order.join(",");
      setData((d) => ({ ...d, settings: { ...d.settings, section_order: joined } }));

      const { error } = await supabase
        .from("settings")
        .update({ section_order: joined })
        .eq("id", 1);
      if (error) {
        alert(
          "Réorganisation impossible : " + error.message +
            " (la migration 0007_section_order a-t-elle été exécutée dans Supabase ?)",
        );
      }
      await refresh();
    },
    [supabase, sectionOrder, refresh],
  );

  // Chaque section emporte son bandeau défilant quand on la déplace.
  const sections: Record<SectionKey, ReactNode> = {
    lineup: (
      <>
          <Marquee />
          <LineUp
            artists={data.artists}
            adminOn={adminOn}
            onRemove={removeArtist}
            onEdit={setEditingArtist}
            onAdd={addArtist}
          />
      </>
    ),
    activities: (
      <>
          <Marquee
            text={"Bingo ★ Loto ★ Pétanque ★ Ravitaillement ★ Chasse au trésor ★ Buvette ★ Zone de récup ★ "}
            color="var(--blue)"
            reverse
          />
          <Activities
            activities={data.activities}
            adminOn={adminOn}
            onRemove={removeActivity}
            onEdit={setEditingActivity}
            onAdd={addActivity}
          />
      </>
    ),
    gallery: (
      <>
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
      </>
    ),
    infos: (
      <>
          <Marquee
            text={"Accès ★ Camping ★ Ravitaillement ★ Carnet de route ★ Crème solaire ★ Covoiturage ★ "}
            color="var(--yellow)"
            reverse
          />
          <InfosPratiques
            infos={data.infos}
            adminOn={adminOn}
            onRemove={removeInfo}
            onEdit={setEditingInfo}
            onAdd={addInfo}
          />
      </>
    ),
  };

  return (
    <div>
      <ScrollBike />
      <BellToggle />
      <Nav billetterieUrl={data.settings.billetterie_url} />
      <Hero settings={data.settings} />
      {sectionOrder.map((key, i) => (
        <div key={key} className={sectionStyles.wrap}>
          {sections[key]}
          {SECTION_STICKERS[key].map((s, j) => {
            // Position sur l'enveloppe (esquive de la souris), rotation sur la
            // pastille elle-même (sinon le transform d'esquive l'écraserait)
            const { transform, ...position } = s.style;
            return (
              <span
                key={`${key}-${j}`}
                className={sectionStyles.stickerPos}
                data-dodge=""
                style={{ ...position, width: s.size, height: s.size }}
                aria-hidden="true"
              >
                <span
                  className={sectionStyles.sticker}
                  // Délais décalés pour que les pastilles ne flottent pas en chœur
                  style={{
                    transform,
                    background: s.bg,
                    fontSize: Math.round(s.size * 0.48),
                    animationDelay: `${((i * 2 + j) % 4) * 0.9}s`,
                  }}
                >
                  {s.emoji}
                </span>
              </span>
            );
          })}
          {adminOn && (
            <div className={sectionStyles.arrows}>
              <button
                type="button"
                className={sectionStyles.btn}
                disabled={i === 0}
                onClick={() => moveSection(i, i - 1)}
                aria-label="Monter la section"
                title="Monter la section"
              >
                ↑
              </button>
              <button
                type="button"
                className={sectionStyles.btn}
                disabled={i === sectionOrder.length - 1}
                onClick={() => moveSection(i, i + 1)}
                aria-label="Descendre la section"
                title="Descendre la section"
              >
                ↓
              </button>
            </div>
          )}
        </div>
      ))}
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
        <EditArtistModal
          artist={editingArtist}
          onSave={saveArtist}
          onClose={() => setEditingArtist(null)}
        />
      )}
      {editingActivity && (
        <EditActivityModal
          activity={editingActivity}
          onSave={saveActivity}
          onClose={() => setEditingActivity(null)}
        />
      )}
      {editingInfo && (
        <EditInfoModal
          info={editingInfo}
          onSave={saveInfo}
          onClose={() => setEditingInfo(null)}
        />
      )}
      {adminsOpen && supabase && (
        <AdminsModal supabase={supabase} onClose={() => setAdminsOpen(false)} />
      )}
    </div>
  );
}
