import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Server-side only - never exposed to client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Supabase admin client for server-side operations
 * Uses service role key - bypasses RLS
 * Only available in API routes (server-side)
 */
export const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null

/**
 * Check if Supabase is properly configured
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseServiceRoleKey)
}
