import { NextResponse } from "next/server";
import { cloudinaryServerEnv, getAdminSupabase, signCloudinaryParams } from "@/lib/server";

/** Dossier Cloudinary où atterrissent toutes les photos du site. */
const FOLDER = "teuf-champetre";

/**
 * Délivre une signature d'upload Cloudinary — uniquement aux admins.
 * Le fichier part ensuite directement du navigateur vers Cloudinary,
 * sans transiter par notre serveur.
 */
export async function POST(request: Request) {
  const supabase = await getAdminSupabase(request);
  if (!supabase) {
    return NextResponse.json({ error: "Accès réservé aux admins." }, { status: 403 });
  }

  const env = cloudinaryServerEnv();
  if (!env) {
    return NextResponse.json(
      { error: "Cloudinary n'est pas configuré (voir README, section Cloudinary)." },
      { status: 500 },
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signCloudinaryParams({ folder: FOLDER, timestamp }, env.apiSecret);

  return NextResponse.json({
    cloudName: env.cloudName,
    apiKey: env.apiKey,
    folder: FOLDER,
    timestamp,
    signature,
  });
}
