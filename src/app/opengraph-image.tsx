import { ImageResponse } from "next/og";

/**
 * Image d'aperçu de partage (WhatsApp, Instagram, iMessage…), générée au build
 * dans le style néo-brutaliste du site — aucun fichier image à maintenir.
 */

export const alt = "Teuf Champêtre — Édition 2026, thème Tour de France";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 28,
          padding: 80,
          background: "#ffd23f",
          color: "#111111",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            background: "#111111",
            color: "#ffd23f",
            padding: "12px 28px",
            fontSize: 32,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 2,
            transform: "rotate(-2deg)",
          }}
        >
          Édition 2026 · 🚴 Thème vélo
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 148,
            fontWeight: 900,
            textTransform: "uppercase",
            lineHeight: 0.95,
            letterSpacing: -3,
          }}
        >
          <span>Teuf</span>
          <span>Champêtre</span>
        </div>
        <div
          style={{
            display: "flex",
            background: "#ffffff",
            border: "6px solid #111111",
            boxShadow: "12px 12px 0 #111111",
            padding: "16px 32px",
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          Un peloton de copains dans un champ 🌾
        </div>
      </div>
    ),
    size,
  );
}
