import type { FestivalData } from "./types";

/**
 * Données d'exemple, identiques à la maquette Claude Design.
 * Utilisées tant que Supabase n'est pas configuré (mode démo),
 * et comme seed initial de la base (voir supabase/seed.sql).
 */
export const DEMO_DATA: FestivalData = {
  settings: {
    edition: "Édition 2026",
    dates: "22–23 août",
    lieu: "Le grand champ, quelque part en campagne",
    billetterie_url: "#billetterie-bientot",
    don_url: "https://www.helloasso.com/associations/le-bouquet/formulaires/1",
    event_start: "2026-08-22T18:00:00+02:00",
    section_order: "lineup,activities,infos,gallery",
  },
  artists: [
    { id: "demo-1", name: "Bétonnière Sonore", genre: "Électro", slot: "Samedi · 23h30", spotify: null, soundcloud: null, instagram: null, position: 0 },
    { id: "demo-2", name: "Les Fourches", genre: "Rock", slot: "Samedi · 21h00", spotify: null, soundcloud: null, instagram: null, position: 1 },
    { id: "demo-3", name: "DJ Paille", genre: "Techno", slot: "Dimanche · 01h00", spotify: null, soundcloud: null, instagram: null, position: 2 },
    { id: "demo-4", name: "Mirabelle Club", genre: "Pop", slot: "Vendredi · 19h00", spotify: null, soundcloud: null, instagram: null, position: 3 },
    { id: "demo-5", name: "Tracteur Rave", genre: "Électro", slot: "Dimanche · 23h00", spotify: null, soundcloud: null, instagram: null, position: 4 },
    { id: "demo-6", name: "Foin Fatal", genre: "Rock", slot: "Dimanche · 20h30", spotify: null, soundcloud: null, instagram: null, position: 5 },
  ],
  activities: [
    { id: "demo-a1", name: "Bingo champêtre",     slot: "Samedi · 15h00",   place: "Sous le chapiteau", position: 0 },
    { id: "demo-a2", name: "Loto des champs",     slot: "Samedi · 17h00",   place: "La grange",         position: 1 },
    { id: "demo-a3", name: "Tournoi de pétanque", slot: "Dimanche · 11h00", place: "Terrain du haut",   position: 2 },
    { id: "demo-a4", name: "Chasse au trésor",    slot: "Vendredi · 18h30", place: "Tout le champ",     position: 3 },
  ],
  infos: [
    { id: "demo-i1", emoji: "🚗", title: "Accès",     body: "À 45 min de la ville, parking dans le pré d'à côté. Covoiturage fortement encouragé — le peloton roule groupé !", position: 0 },
    { id: "demo-i2", emoji: "⛺", title: "Camping",   body: "Plante ta tente où tu veux dans le champ du haut. Réveil au chant du coq garanti, café offert aux lève-tôt.", position: 1 },
    { id: "demo-i3", emoji: "🎒", title: "À apporter", body: "Gourde, crème solaire, lampe frontale et ta plus belle tenue de cycliste. Laisse le verre à la maison.", position: 2 },
  ],
  photos: PLACEHOLDER_LABELS(),
};

function PLACEHOLDER_LABELS() {
  return [
    "foule devant la scène",
    "coucher de soleil sur le champ",
    "DJ set de nuit",
    "copains au camping",
    "pogo édition dernière",
    "guirlandes + bottes de foin",
  ].map((label, i) => ({
    id: `placeholder-${i}`,
    publicId: "",
    label,
    url: null,
    srcSet: null,
    largeUrl: null,
    position: i,
  }));
}

/** Placeholders affichés quand la galerie réelle est encore vide. */
export const PLACEHOLDER_PHOTOS = PLACEHOLDER_LABELS();
