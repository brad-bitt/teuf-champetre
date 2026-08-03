/**
 * Groove disco minimaliste synthétisé en Web Audio (aucun fichier audio) :
 * grosse caisse sur les temps, charley sur les contretemps, basse funky.
 * Un ordonnanceur regarde 250 ms devant pour caler les notes précisément.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let nextTime = 0;
let step = 0;

const TEMPO = 118;
const STEP = 60 / TEMPO / 2; // croches

/** Boom : sinus qui plonge de 150 à 45 Hz. */
function kick(at: number) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.frequency.setValueAtTime(150, at);
  osc.frequency.exponentialRampToValueAtTime(45, at + 0.12);
  env.gain.setValueAtTime(0.5, at);
  env.gain.exponentialRampToValueAtTime(0.001, at + 0.25);
  osc.connect(env).connect(master);
  osc.start(at);
  osc.stop(at + 0.3);
}

/** Tss : souffle bref filtré dans l'aigu. */
function hat(at: number) {
  if (!ctx || !master) return;
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 7000;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.1, at);
  env.gain.exponentialRampToValueAtTime(0.001, at + 0.05);
  src.connect(hp).connect(env).connect(master);
  src.start(at);
}

/** Basse : dent de scie adoucie au passe-bas. */
function bass(at: number, freq: number) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = freq;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 480;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.14, at);
  env.gain.exponentialRampToValueAtTime(0.001, at + STEP * 0.9);
  osc.connect(lp).connect(env).connect(master);
  osc.start(at);
  osc.stop(at + STEP);
}

// La ligne de basse sur 2 mesures (0 = silence) : la, la, do, ré… ça groove
const BASSLINE = [55, 0, 55, 55, 0, 65.41, 73.42, 65.41, 55, 0, 55, 55, 0, 82.41, 73.42, 65.41];

function schedule() {
  if (!ctx) return;
  while (nextTime < ctx.currentTime + 0.25) {
    const i = step % BASSLINE.length;
    if (i % 2 === 0) kick(nextTime);
    else hat(nextTime);
    const freq = BASSLINE[i];
    if (freq) bass(nextTime, freq);
    nextTime += STEP;
    step += 1;
  }
}

export function startDisco() {
  try {
    if (timer) return; // déjà en train de jouer
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    if (!master) {
      master = ctx.createGain();
      master.gain.value = 0.8;
      master.connect(ctx.destination);
    }
    nextTime = ctx.currentTime + 0.06;
    step = 0;
    schedule();
    timer = setInterval(schedule, 100);
  } catch {
    // Pas d'audio : la boule disco descendra en silence
  }
}

export function stopDisco() {
  if (timer) clearInterval(timer);
  timer = null; // les notes déjà programmées finissent leur (court) sustain
}
