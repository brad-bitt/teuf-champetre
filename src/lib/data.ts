import type { SupabaseClient } from "@supabase/supabase-js";
import { DEMO_DATA } from "./demo-data";
import type { FestivalData, Photo } from "./types";

/**
 * Charge settings + artistes + photos depuis Supabase.
 * Utilisé côté serveur (rendu initial) et côté client (refresh après une action admin).
 */
export async function fetchFestivalData(supabase: SupabaseClient): Promise<FestivalData> {
  const [settingsRes, artistsRes, photosRes] = await Promise.all([
    supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("artists").select("*").order("position").order("created_at"),
    supabase.from("photos").select("*").order("created_at"),
  ]);

  const error = settingsRes.error ?? artistsRes.error ?? photosRes.error;
  if (error) throw new Error(`Supabase: ${error.message}`);

  const photos: Photo[] = (photosRes.data ?? []).map((p) => ({
    id: p.id,
    path: p.path,
    label: p.label ?? "",
    url: supabase.storage.from("photos").getPublicUrl(p.path).data.publicUrl,
  }));

  return {
    settings: settingsRes.data ?? DEMO_DATA.settings,
    artists: artistsRes.data ?? [],
    photos,
  };
}
