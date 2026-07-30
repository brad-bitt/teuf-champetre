import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** false ⇒ mode démo : données d'exemple, admin désactivé. */
export const supabaseConfigured = Boolean(url && anonKey);

let browserClient: SupabaseClient | null = null;

/** Client navigateur (singleton) — session persistée, OAuth détecté dans l'URL. */
export function getBrowserSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!browserClient) browserClient = createClient(url!, anonKey!);
  return browserClient;
}

/** Client côté serveur, anonyme et sans session — lectures publiques uniquement. */
export function getServerSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  return createClient(url!, anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
