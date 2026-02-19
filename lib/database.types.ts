/**
 * Database type definitions for Supabase
 *
 * To auto-generate these types from your Supabase schema, run:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      recipes: {
        Relationships: []
        Row: {
          id: string
          created_by: string
          recipe_name: string
          description: string
          servings: number
          prep_time_minutes: number
          cook_time_minutes: number
          difficulty: Database['public']['Enums']['recipe_difficulty']
          portion_size: string | null
          ingredients: Json
          steps: Json
          nutrition: Json
          health_benefits: Json | null
          warnings: Json | null
          health_score: number
          dietary_tags: string[]

          time_of_day: Database['public']['Enums']['recipe_time_of_day'][]
          share_visibility: Database['public']['Enums']['recipe_share_visibility']
          slug: string
          language: string | null
          photo_path: string | null
          photo_url: string | null
          photo_width: number | null
          photo_height: number | null
          photo_size_bytes: number | null
          photo_moderation_status: string | null
          photo_moderated_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          embedding: number[] | null
        }
        Insert: {
          id?: string
          created_by: string
          recipe_name: string
          description: string
          servings: number
          prep_time_minutes: number
          cook_time_minutes: number
          difficulty: Database['public']['Enums']['recipe_difficulty']
          portion_size?: string | null
          ingredients: Json
          steps: Json
          nutrition: Json
          health_benefits?: Json | null
          warnings?: Json | null
          health_score: number
          dietary_tags?: string[]

          time_of_day?: Database['public']['Enums']['recipe_time_of_day'][]
          share_visibility?: Database['public']['Enums']['recipe_share_visibility']
          slug?: string
          language?: string | null
          photo_path?: string | null
          photo_url?: string | null
          photo_width?: number | null
          photo_height?: number | null
          photo_size_bytes?: number | null
          photo_moderation_status?: string | null
          photo_moderated_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          embedding?: number[] | null
        }
        Update: {
          id?: string
          created_by?: string
          recipe_name?: string
          description?: string
          servings?: number
          prep_time_minutes?: number
          cook_time_minutes?: number
          difficulty?: Database['public']['Enums']['recipe_difficulty']
          portion_size?: string | null
          ingredients?: Json
          steps?: Json
          nutrition?: Json
          health_benefits?: Json | null
          warnings?: Json | null
          health_score?: number
          dietary_tags?: string[]

          time_of_day?: Database['public']['Enums']['recipe_time_of_day'][]
          share_visibility?: Database['public']['Enums']['recipe_share_visibility']
          slug?: string
          language?: string | null
          photo_path?: string | null
          photo_url?: string | null
          photo_width?: number | null
          photo_height?: number | null
          photo_size_bytes?: number | null
          photo_moderation_status?: string | null
          photo_moderated_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          embedding?: number[] | null
        }
      }
      marketing_waitlist: {
        Relationships: []
        Row: {
          id: string
          email: string
          locale: string | null
          source: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          locale?: string | null
          source?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          locale?: string | null
          source?: string | null
          created_at?: string
        }
      }
      premium_config: {
        Relationships: []
        Row: {
          feature_slug: string
          display_name: string
          free_monthly_limit: number
          is_premium_only: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          feature_slug: string
          display_name: string
          free_monthly_limit?: number
          is_premium_only?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          feature_slug?: string
          display_name?: string
          free_monthly_limit?: number
          is_premium_only?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      recipe_difficulty: 'EASY' | 'MEDIUM' | 'HARD'
      recipe_share_visibility: 'PRIVATE' | 'UNLISTED' | 'PUBLIC'
      recipe_time_of_day: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
    }
  }
}
