import FestivalSite from "@/components/FestivalSite";
import { fetchFestivalData } from "@/lib/data";
import { DEMO_DATA } from "@/lib/demo-data";
import { getServerSupabase } from "@/lib/supabase";

// Toujours rendre avec les données fraîches (le contenu est géré via le back-office)
export const revalidate = 0;

export default async function Page() {
  const supabase = getServerSupabase();

  let data = DEMO_DATA;
  let demoMode = true;

  if (supabase) {
    try {
      data = await fetchFestivalData(supabase);
      demoMode = false;
    } catch (e) {
      // Supabase configuré mais indisponible / migrations pas encore appliquées :
      // on retombe sur la démo pour ne jamais afficher une page cassée.
      console.error("Chargement Supabase impossible, affichage des données de démo :", e);
    }
  }

  return <FestivalSite initialData={data} demoMode={demoMode} />;
}
