import type { Database } from './database.types'

export type RecipeDifficulty = Database['public']['Enums']['recipe_difficulty']
export type RecipeShareVisibility = Database['public']['Enums']['recipe_share_visibility']
export type RecipeTimeOfDay = Database['public']['Enums']['recipe_time_of_day']
export type RecipeLanguage = 'cs' | 'en'

export type Ingredient = {
  name: string
  amount?: string
  unit?: string
}

export type NutritionInfo = {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
}

export type HealthBenefit = {
  benefit: string
  description?: string
}

export type Warning = {
  type: string
  message: string
}

export type Recipe = Database['public']['Tables']['recipes']['Row']

export type RecipeFormData = {
  recipe_name: string
  description: string
  servings: number
  prep_time_minutes: number
  cook_time_minutes: number
  difficulty: RecipeDifficulty
  portion_size: string | null
  ingredients: Ingredient[]
  steps: string[]
  nutrition: NutritionInfo
  health_benefits: HealthBenefit[]
  warnings: Warning[]
  health_score: number
  dietary_tags: string[]
  meal_categories: string[]
  time_of_day: RecipeTimeOfDay | null
  share_visibility: RecipeShareVisibility
  language: RecipeLanguage | null
}

export const DEFAULT_NUTRITION: NutritionInfo = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
}

export const EMPTY_RECIPE_FORM: RecipeFormData = {
  recipe_name: '',
  description: '',
  servings: 1,
  prep_time_minutes: 0,
  cook_time_minutes: 0,
  difficulty: 'EASY',
  portion_size: null,
  ingredients: [],
  steps: [],
  nutrition: DEFAULT_NUTRITION,
  health_benefits: [],
  warnings: [],
  health_score: 50,
  dietary_tags: [],
  meal_categories: [],
  time_of_day: null,
  share_visibility: 'UNLISTED',
  language: 'en',
}
