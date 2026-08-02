import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

/**
 * Métadonnées par défaut — la page d'accueil les affine avec les données
 * réelles (dates, lieu) via generateMetadata. metadataBase résout toutes les
 * URL relatives (canonical, og:image…) vers l'URL de production.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Festival entre copains · Édition 2026`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Cette année on enfile le maillot : la Teuf passe en mode Tour de France. Électro qui tape, rock qui transpire, pop qui colle — et un peloton de copains dans un champ.",
  keywords: [
    "teuf champêtre",
    "teuf champetre",
    "festival",
    "festival entre amis",
    "fête champêtre",
    "festival champêtre",
    "musique électro",
  ],
  robots: {
    index: true,
    follow: true,
  },
  // Preuve de propriété pour Google Search Console
  verification: {
    google: "myoVQw8uDVRNU-22VGIDME-GWZgHRa11781jT2NIrE8",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${archivoBlack.variable} ${spaceGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
