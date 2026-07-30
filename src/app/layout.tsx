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

export const metadata: Metadata = {
  title: "Teuf Champêtre — Édition 2026",
  description:
    "Cette année on enfile le maillot : la Teuf passe en mode Tour de France. Électro qui tape, rock qui transpire, pop qui colle — et un peloton de copains dans un champ.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${archivoBlack.variable} ${spaceGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
