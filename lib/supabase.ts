import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const serverClientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

/**
 * Server-side public client for non-admin read/write operations.
 * Uses anon key + RLS.
 */
export const supabasePublic =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, serverClientOptions)
    : null;

/**
 * Supabase admin client for server-side operations
 * Uses service role key - bypasses RLS
 * Only available in API routes (server-side)
 */
export const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, serverClientOptions)
    : null;

export const isSupabasePublicConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

export const isSupabaseAdminConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
};

/**
 * Backward-compatible alias for admin configuration checks.
 */
export const isSupabaseConfigured = (): boolean => {
  return isSupabaseAdminConfigured();
};
