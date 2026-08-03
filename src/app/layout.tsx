import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
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

const description =
  "Cette année on enfile le maillot : la Teuf passe en mode Tour de France. Électro qui tape, rock qui transpire, pop qui colle — et un peloton de copains dans un champ.";

export const metadata: Metadata = {
  // Base des URLs absolues (image OG notamment) pour les aperçus de partage
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://teuf-champetre.vercel.app"),
  title: "Teuf Champêtre — Édition 2026",
  description,
  openGraph: {
    title: "Teuf Champêtre — Édition 2026",
    description,
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${archivoBlack.variable} ${spaceGrotesk.variable}`}>
      <head>
        {/* Les photos viennent toutes de Cloudinary : on ouvre la connexion en avance */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
