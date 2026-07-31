/** Côté client : construction des URLs d'affichage Cloudinary. */

export const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

export const cloudinaryConfigured = Boolean(cloudinaryCloudName);

/**
 * URL optimisée d'une photo : format moderne (WebP/AVIF) + compression auto,
 * redimensionnée à 800px de large — largement assez pour des vignettes de 220px
 * de haut, et ~20× plus léger qu'une photo de téléphone brute.
 */
export function photoUrl(publicId: string): string | null {
  if (!cloudinaryCloudName || !publicId) return null;
  return `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/f_auto,q_auto,w_800/${publicId}`;
}

/** URL grand format pour la lightbox (1600px, toujours optimisée). */
export function photoLargeUrl(publicId: string): string | null {
  if (!cloudinaryCloudName || !publicId) return null;
  return `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/f_auto,q_auto,w_1600/${publicId}`;
}
