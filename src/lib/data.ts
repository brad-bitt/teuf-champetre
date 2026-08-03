import type { SupabaseClient } from "@supabase/supabase-js";
import { photoLargeUrl, photoSrcSet, photoUrl } from "./cloudinary";
import { DEMO_DATA } from "./demo-data";
import type { FestivalData, Photo } from "./types";

/**
 * Charge settings + artistes + photos depuis Supabase.
 * Utilisé côté serveur (rendu initial) et côté client (refresh après une action admin).
 * Les images elles-mêmes sont servies par Cloudinary (URL construite depuis public_id).
 */
export async function fetchFestivalData(supabase: SupabaseClient): Promise<FestivalData> {
  const [settingsRes, artistsRes, activitiesRes, infosRes, photosRes] = await Promise.all([
    supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("artists").select("*").order("position").order("created_at"),
    supabase.from("activities").select("*").order("position").order("created_at"),
    supabase.from("infos").select("*").order("position").order("created_at"),
    // Tri côté client : `order("position")` planterait tant que la migration
    // 0004 n'est pas passée — le fallback JS marche avant comme après.
    supabase.from("photos").select("*"),
  ]);

  const error = settingsRes.error ?? artistsRes.error ?? photosRes.error;
  if (error) throw new Error(`Supabase: ${error.message}`);

  // La table activities peut manquer si la migration 0003 n'a pas encore été
  // exécutée : on affiche le reste du site plutôt que de tout basculer en démo.
  if (activitiesRes.error) {
    console.error("Activités indisponibles (migration 0003 exécutée ?) :", activitiesRes.error.message);
  }
  // Même tolérance pour les infos pratiques (migration 0006).
  if (infosRes.error) {
    console.error("Infos pratiques indisponibles (migration 0006 exécutée ?) :", infosRes.error.message);
  }

  const photos: Photo[] = (photosRes.data ?? [])
    .slice()
    .sort(
      (a, b) =>
        (a.position ?? 0) - (b.position ?? 0) ||
        String(a.created_at).localeCompare(String(b.created_at)),
    )
    .map((p) => ({
      id: p.id,
      publicId: p.public_id,
      label: p.label ?? "",
      url: photoUrl(p.public_id),
      srcSet: photoSrcSet(p.public_id),
      largeUrl: photoLargeUrl(p.public_id),
      position: p.position ?? 0,
    }));

  return {
    settings: settingsRes.data ?? DEMO_DATA.settings,
    artists: artistsRes.data ?? [],
    activities: activitiesRes.data ?? [],
    infos: infosRes.data ?? [],
    photos,
  };
}
