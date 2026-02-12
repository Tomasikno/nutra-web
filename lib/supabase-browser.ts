import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Browser-safe Supabase client for frontend usage.
 * Uses only NEXT_PUBLIC env vars.
 */
export const supabaseBrowser =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseBrowserConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};
