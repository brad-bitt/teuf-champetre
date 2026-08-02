import { ImageResponse } from "next/og";

/**
 * Image de partage (Open Graph / Twitter) générée au build dans le style
 * néo-brutaliste du site. Next l'expose en /opengraph-image et ajoute
 * automatiquement les balises og:image / twitter:image.
 */

export const alt = "Teuf Champêtre — le festival entre copains, thème Tour de France";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f0e6",
          border: "16px solid #111",
          position: "relative",
        }}
      >
        {/* Soleil jaune, clin d'œil au hero */}
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 80,
            width: 160,
            height: 160,
            borderRadius: 9999,
            background: "#ffd23f",
            border: "6px solid #111",
          }}
        />
        <div
          style={{
            display: "flex",
            background: "#ff5fa8",
            border: "6px solid #111",
            padding: "10px 28px",
            fontSize: 34,
            color: "#111",
            boxShadow: "10px 10px 0 #111",
            marginBottom: 44,
          }}
        >
          🚴 Festival entre copains · Thème vélo
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: 150,
            fontWeight: 800,
            color: "#111",
            lineHeight: 1.02,
            textTransform: "uppercase",
            letterSpacing: -4,
          }}
        >
          <span>Teuf</span>
          <span>Champêtre</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            background: "#a6e05a",
            border: "6px solid #111",
            padding: "12px 32px",
            fontSize: 36,
            color: "#111",
            boxShadow: "10px 10px 0 #111",
          }}
        >
          Électro qui tape · Rock qui transpire · Pop qui colle
        </div>
      </div>
    ),
    size,
  );
}
