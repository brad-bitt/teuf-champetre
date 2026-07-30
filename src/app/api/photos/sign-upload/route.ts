import { NextResponse } from "next/server";
import { cloudinaryServerEnv, getAdminSupabase, signCloudinaryParams } from "@/lib/server";

/** Dossier Cloudinary où atterrissent toutes les photos du site. */
const FOLDER = "teuf-champetre";

/**
 * Formats acceptés, inscrits DANS la signature : Cloudinary refuse tout ce qui
 * n'est pas dans cette liste. Sans ça, la signature délivrée ici vaut pour
 * n'importe quel fichier (PDF, exécutable…) pendant sa durée de validité.
 */
const ALLOWED_FORMATS = "jpg,jpeg,png,webp,gif,heic,avif";

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
  // Tout paramètre signé doit être renvoyé tel quel par le navigateur à
  // Cloudinary, sinon la signature ne correspond plus et l'upload est refusé.
  const signature = signCloudinaryParams(
    { allowed_formats: ALLOWED_FORMATS, folder: FOLDER, timestamp },
    env.apiSecret,
  );

  return NextResponse.json({
    cloudName: env.cloudName,
    apiKey: env.apiKey,
    folder: FOLDER,
    allowedFormats: ALLOWED_FORMATS,
    timestamp,
    signature,
  });
}
