import type { SupabaseClient } from "@supabase/supabase-js";
import { photoUrl } from "./cloudinary";
import { DEMO_DATA } from "./demo-data";
import type { FestivalData, Photo } from "./types";

/**
 * Charge settings + artistes + photos depuis Supabase.
 * Utilisé côté serveur (rendu initial) et côté client (refresh après une action admin).
 * Les images elles-mêmes sont servies par Cloudinary (URL construite depuis public_id).
 */
export async function fetchFestivalData(supabase: SupabaseClient): Promise<FestivalData> {
  const [settingsRes, artistsRes, activitiesRes, photosRes] = await Promise.all([
    supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("artists").select("*").order("position").order("created_at"),
    supabase.from("activities").select("*").order("position").order("created_at"),
    supabase.from("photos").select("*").order("created_at"),
  ]);

  const error = settingsRes.error ?? artistsRes.error ?? photosRes.error;
  if (error) throw new Error(`Supabase: ${error.message}`);

  // La table activities peut manquer si la migration 0003 n'a pas encore été
  // exécutée : on affiche le reste du site plutôt que de tout basculer en démo.
  if (activitiesRes.error) {
    console.error("Activités indisponibles (migration 0003 exécutée ?) :", activitiesRes.error.message);
  }

  const photos: Photo[] = (photosRes.data ?? []).map((p) => ({
    id: p.id,
    publicId: p.public_id,
    label: p.label ?? "",
    url: photoUrl(p.public_id),
  }));

  return {
    settings: settingsRes.data ?? DEMO_DATA.settings,
    artists: artistsRes.data ?? [],
    activities: activitiesRes.data ?? [],
    photos,
  };
}
