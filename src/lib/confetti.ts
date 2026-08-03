/** Salve de confettis aux couleurs du site, dessinée dans un canvas éphémère. */

const COLORS = ["#ff5fa8", "#ffd23f", "#e4572e", "#a6e05a", "#9ecbff", "#fffbe8"];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vrot: number;
  color: string;
};

/**
 * Fait exploser des confettis au point (x, y) en coordonnées viewport.
 * Le canvas (plein écran, pointer-events: none) vit le temps de la retombée
 * puis se retire tout seul — chaque salve est indépendante.
 */
export function burstConfetti(x: number, y: number, count = 90) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "300",
  });
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  document.body.appendChild(canvas);

  const particles: Particle[] = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 11;
    return {
      x,
      y,
      // Poussée vers le haut : ça part en fontaine plutôt qu'en étoile
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 7,
      w: 5 + Math.random() * 7,
      h: 4 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  });

  const GRAVITY = 0.35;
  const DRAG = 0.985;
  let frames = 0;

  const step = () => {
    frames += 1;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let alive = 0;
    for (const p of particles) {
      p.vx *= DRAG;
      p.vy = p.vy * DRAG + GRAVITY;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      if (p.y < window.innerHeight + 30) {
        alive += 1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    }
    // Filet de sécurité à ~5 s si un confetti s'attarde
    if (alive > 0 && frames < 300) {
      requestAnimationFrame(step);
    } else {
      canvas.remove();
    }
  };
  requestAnimationFrame(step);
}
