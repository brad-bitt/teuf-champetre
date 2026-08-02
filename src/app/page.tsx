import type { Metadata } from "next";
import { cache } from "react";
import FestivalSite from "@/components/FestivalSite";
import { fetchFestivalData } from "@/lib/data";
import { DEMO_DATA } from "@/lib/demo-data";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { getServerSupabase } from "@/lib/supabase";

// Toujours rendre avec les données fraîches (le contenu est géré via le back-office)
export const revalidate = 0;

/**
 * Chargement partagé entre generateMetadata et la page : cache() garantit une
 * seule requête Supabase par rendu.
 */
const loadFestival = cache(async () => {
  const supabase = getServerSupabase();

  if (supabase) {
    try {
      return { data: await fetchFestivalData(supabase), demoMode: false };
    } catch (e) {
      // Supabase configuré mais indisponible / migrations pas encore appliquées :
      // on retombe sur la démo pour ne jamais afficher une page cassée.
      console.error("Chargement Supabase impossible, affichage des données de démo :", e);
    }
  }

  return { data: DEMO_DATA, demoMode: true };
});

/** Le champ lieu peut être saisi « Lieu : X » dans le back-office — on retire le préfixe. */
const cleanLieu = (lieu: string) => lieu.replace(/^\s*lieu\s*:\s*/i, "");

/** Titre + description construits avec les vraies infos du back-office. */
export async function generateMetadata(): Promise<Metadata> {
  const { data } = await loadFestival();
  const { edition, dates } = data.settings;
  const lieu = cleanLieu(data.settings.lieu);

  const title = `${SITE_NAME} — Festival entre copains · ${edition}`;
  const description =
    `${SITE_NAME}, le festival entre copains : ${dates}, ${lieu}. ` +
    "Électro qui tape, rock qui transpire, pop qui colle — programmation, activités et photos, thème Tour de France.";

  return {
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: "/",
      siteName: SITE_NAME,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Page() {
  const { data, demoMode } = await loadFestival();
  const { edition, dates, billetterie_url } = data.settings;
  const lieu = cleanLieu(data.settings.lieu);

  /**
   * Données structurées schema.org : décrivent le festival aux moteurs de
   * recherche (nom, lieu, artistes, billetterie) — aide Google à comprendre
   * que « Teuf Champêtre » est un événement musical.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Festival",
    name: SITE_NAME,
    alternateName: "Teuf Champetre",
    description: `${SITE_NAME} ${edition} — festival de musique entre copains, ${dates}, thème Tour de France.`,
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image`,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: lieu,
      address: { "@type": "PostalAddress", addressCountry: "FR" },
    },
    performer: data.artists.map((a) => ({ "@type": "MusicGroup", name: a.name })),
    ...(billetterie_url
      ? { offers: { "@type": "Offer", url: billetterie_url } }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // `<` échappé pour qu'un nom d'artiste ne puisse pas fermer la balise script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <FestivalSite initialData={data} demoMode={demoMode} />
    </>
  );
}
