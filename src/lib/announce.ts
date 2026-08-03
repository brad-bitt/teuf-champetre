/**
 * « TEUF CHAMPÊTRE ! » façon annonceur de Mortal Kombat : synthèse vocale du
 * navigateur, voix la plus grave possible, débit lent — aucun fichier audio.
 * Le rendu dépend des voix installées sur la machine du visiteur.
 */

let voice: SpeechSynthesisVoice | null = null;

function pickVoice() {
  // Une voix française de préférence (« Champêtre » prononcé correctement)
  const voices = window.speechSynthesis.getVoices();
  voice =
    voices.find((v) => v.lang.startsWith("fr") && v.localService) ??
    voices.find((v) => v.lang.startsWith("fr")) ??
    null;
}

export function announceTeuf() {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (!voice) {
      pickVoice();
      // Chrome charge les voix en asynchrone au premier appel
      synth.onvoiceschanged = pickVoice;
    }
    // Un clic en plein cri : on recommence l'annonce depuis le début
    synth.cancel();
    const u = new SpeechSynthesisUtterance("Teuf. Champêtre !");
    u.lang = "fr-FR";
    if (voice) u.voice = voice;
    u.pitch = 0.1; // le plus caverneux possible
    u.rate = 0.75; // lent et solennel
    u.volume = 1;
    synth.speak(u);
  } catch {
    // Pas de synthèse vocale : le clic reste silencieux, sans rien casser
  }
}
