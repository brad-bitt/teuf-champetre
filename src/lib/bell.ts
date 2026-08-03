/**
 * « Dring-dring » de sonnette de vélo synthétisé en Web Audio — aucun fichier
 * son à charger. L'AudioContext est créé au premier clic (geste utilisateur,
 * exigé par les navigateurs) puis réutilisé.
 */

let ctx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

/** Petit souffle métallique : le « tac » du marteau qui frappe la cloche. */
function strike(at: number) {
  if (!ctx) return;
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 5200;
  band.Q.value = 2;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.12, at);
  env.gain.exponentialRampToValueAtTime(0.0001, at + 0.03);
  src.connect(band).connect(env).connect(ctx.destination);
  src.start(at);
}

/**
 * Un coup de sonnette : paires de partiels légèrement désaccordés — leur
 * battement donne le chatoiement métallique d'une vraie cloche de vélo.
 */
function ding(at: number) {
  if (!ctx) return;
  strike(at);
  const partials: Array<[freq: number, gain: number, decay: number]> = [
    [2960, 0.4, 0.5],
    [2973, 0.4, 0.5],
    [4430, 0.14, 0.3],
    [4449, 0.14, 0.3],
    [5920, 0.05, 0.18],
  ];
  for (const [freq, gain, decay] of partials) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * (0.998 + Math.random() * 0.004);
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(gain * 0.22, at + 0.003);
    env.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    osc.connect(env).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + decay + 0.05);
  }
}

export function ringBell() {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    ding(now);
    ding(now + 0.085);
  } catch {
    // Pas d'audio disponible : la sonnette reste muette, sans casser le clic
  }
}
