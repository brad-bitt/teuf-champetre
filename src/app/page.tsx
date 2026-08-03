import FestivalSite from "@/components/FestivalSite";
import { fetchFestivalData } from "@/lib/data";
import { DEMO_DATA } from "@/lib/demo-data";
import { getServerSupabase } from "@/lib/supabase";

// Page servie depuis le cache et régénérée au plus toutes les 60 s : le public
// a un affichage instantané, les admins voient leurs modifs tout de suite via
// le refresh client de FestivalSite (fetch direct Supabase).
export const revalidate = 60;

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
