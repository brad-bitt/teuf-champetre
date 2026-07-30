import type { NextConfig } from "next";

/**
 * Le compte Cloudinary du site. Sert à n'autoriser QUE nos propres images
 * dans l'optimiseur Next : sans ce filtre, `/_next/image` accepte n'importe
 * quel compte Cloudinary et devient un proxy d'images ouvert.
 */
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Content-Security-Policy — liste blanche des origines que la page a le droit
 * de contacter. `script-src` reste permissif (`unsafe-inline`/`unsafe-eval`) car
 * Next.js injecte ses propres scripts inline ; durcir davantage imposerait un
 * système de nonce via middleware. On bloque déjà l'essentiel : scripts d'une
 * origine tierce, mise en iframe, injection de <base>, plugins.
 */
const csp = [
  "default-src 'self'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  // Supabase (REST + realtime en websocket) et l'API d'upload Cloudinary
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.cloudinary.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  // Le back-office s'affiche dans la page : sans ça, un site tiers peut la
  // mettre en iframe invisible et piéger les clics d'un admin (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Empêche le navigateur de « deviner » un type MIME (une image devinée en JS…)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Ne fuite pas l'URL complète (avec ses paramètres) vers les sites externes
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Le site n'a besoin d'aucune de ces API : on les coupe.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // Force le HTTPS pendant 1 an (sans effet en local, l'en-tête est ignoré en http)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  // N'annonce pas la version de Next dans les réponses
  poweredByHeader: false,

  images: {
    remotePatterns: [
      // Photos servies par Cloudinary — restreint à notre seul compte
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: cloudName ? `/${cloudName}/**` : "/**",
      },
    ],
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
