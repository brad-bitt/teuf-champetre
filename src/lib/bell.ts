/**
 * « Dring-dring » de sonnette de vélo synthétisé en Web Audio — aucun fichier
 * son à charger. L'AudioContext est créé au premier clic (geste utilisateur,
 * exigé par les navigateurs) puis réutilisé.
 */

let ctx: AudioContext | null = null;

/** Un coup de sonnette : trois partiels métalliques qui s'éteignent vite. */
function ding(at: number) {
  if (!ctx) return;
  const partials: Array<[freq: number, gain: number]> = [
    [2093, 0.5],
    [2637, 0.25],
    [3520, 0.12],
  ];
  for (const [freq, gain] of partials) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = "sine";
    // Léger désaccord aléatoire : deux coups ne sonnent jamais exactement pareil
    osc.frequency.value = freq * (0.99 + Math.random() * 0.02);
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(gain * 0.25, at + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, at + 0.35);
    osc.connect(env).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + 0.4);
  }
}

export function ringBell() {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    ding(now);
    ding(now + 0.09);
  } catch {
    // Pas d'audio disponible : la sonnette reste muette, sans casser le clic
  }
}
