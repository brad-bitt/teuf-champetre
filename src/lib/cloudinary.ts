/** Côté client : construction des URLs d'affichage Cloudinary. */

export const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

export const cloudinaryConfigured = Boolean(cloudinaryCloudName);

function transformedUrl(publicId: string, width: number): string | null {
  if (!cloudinaryCloudName || !publicId) return null;
  return `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/f_auto,q_auto,w_${width}/${publicId}`;
}

/**
 * URL optimisée d'une photo : format moderne (WebP/AVIF) + compression auto,
 * redimensionnée à 400px de large — assez pour des vignettes de 220px de haut
 * (le srcset fournit le 800px aux écrans haute densité).
 */
export function photoUrl(publicId: string): string | null {
  return transformedUrl(publicId, 400);
}

/** srcset des vignettes : le navigateur choisit selon la taille et la densité d'écran. */
export function photoSrcSet(publicId: string): string | null {
  const small = transformedUrl(publicId, 400);
  const large = transformedUrl(publicId, 800);
  return small && large ? `${small} 400w, ${large} 800w` : null;
}

/** URL grand format pour la lightbox (1600px, toujours optimisée). */
export function photoLargeUrl(publicId: string): string | null {
  return transformedUrl(publicId, 1600);
}
