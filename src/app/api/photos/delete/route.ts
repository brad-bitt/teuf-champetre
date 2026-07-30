import { NextResponse } from "next/server";
import { cloudinaryServerEnv, getAdminSupabase, signCloudinaryParams } from "@/lib/server";

/**
 * Supprime une photo : la ligne en base (via le jeton de l'admin, donc sous RLS)
 * puis le fichier chez Cloudinary (l'API destroy exige le secret, d'où cette route).
 */
export async function POST(request: Request) {
  const supabase = await getAdminSupabase(request);
  if (!supabase) {
    return NextResponse.json({ error: "Accès réservé aux admins." }, { status: 403 });
  }

  const { id } = (await request.json().catch(() => ({}))) as { id?: string };
  if (!id) {
    return NextResponse.json({ error: "id manquant." }, { status: 400 });
  }

  const { data: photo, error: readError } = await supabase
    .from("photos")
    .select("public_id")
    .eq("id", id)
    .maybeSingle();
  if (readError) {
    return NextResponse.json({ error: readError.message }, { status: 500 });
  }
  if (!photo) {
    return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });
  }

  const { error: deleteError } = await supabase.from("photos").delete().eq("id", id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // Nettoyage du fichier Cloudinary (best effort : la photo a déjà disparu du site)
  const env = cloudinaryServerEnv();
  if (env && photo.public_id) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = signCloudinaryParams(
      { public_id: photo.public_id, timestamp },
      env.apiSecret,
    );
    const body = new URLSearchParams({
      public_id: photo.public_id,
      timestamp: String(timestamp),
      api_key: env.apiKey,
      signature,
    });
    try {
      await fetch(`https://api.cloudinary.com/v1_1/${env.cloudName}/image/destroy`, {
        method: "POST",
        body,
      });
    } catch (e) {
      console.error("Suppression Cloudinary échouée :", e);
    }
  }

  return NextResponse.json({ ok: true });
}
