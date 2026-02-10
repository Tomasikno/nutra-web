"use client";

import type { NutritionInfo, RecipeFormData } from "@/lib/recipe-types";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const parseMaybeJson = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const readNumber = (source: Record<string, unknown>, keys: string[]): number | null => {
  for (const key of keys) {
    if (!(key in source)) continue;
    const value = toNumber(source[key]);
    if (value !== null) return value;
  }
  return null;
};

const resolveNutritionSource = (raw: unknown): Record<string, unknown> | null => {
  const parsed = parseMaybeJson(raw);
  if (!isObject(parsed)) return null;

  const perServing = parsed.perServing ?? parsed.per_serving;
  if (isObject(perServing)) return perServing;

  const total = parsed.total;
  if (isObject(total)) return total;

  return parsed;
};

export const coerceNutritionInfo = (raw: unknown): NutritionInfo => {
  const source = resolveNutritionSource(raw);
  if (!source) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 };
  }

  const calories =
    readNumber(source, ["calories", "kcal", "energyKcal"]) ?? 0;
  const protein =
    readNumber(source, ["protein", "proteinG", "protein_g"]) ?? 0;
  const carbs =
    readNumber(source, ["carbs", "carbsG", "carbs_g"]) ?? 0;
  const fat =
    readNumber(source, ["fat", "fatG", "fat_g"]) ?? 0;
  const fiber =
    readNumber(source, ["fiber", "fiberG", "fiber_g"]) ?? 0;
  const sugar =
    readNumber(source, ["sugar", "sugarG", "sugar_g"]) ?? 0;

  return { calories, protein, carbs, fat, fiber, sugar };
};

export const buildNutritionPayload = (
  form: RecipeFormData,
  existing?: unknown
): Record<string, unknown> => {
  const base = isObject(existing) ? { ...existing } : {};

  const perServingBase = isObject(base.perServing) ? base.perServing : {};
  const totalBase = isObject(base.total) ? base.total : {};

  const calories = form.nutrition.calories;
  const proteinG = form.nutrition.protein;
  const carbsG = form.nutrition.carbs;
  const fatG = form.nutrition.fat;
  const fiberG = form.nutrition.fiber;
  const sugarG = form.nutrition.sugar;

  const servings = Number.isFinite(form.servings) && form.servings > 0 ? form.servings : 1;

  return {
    ...base,
    perServing: {
      ...perServingBase,
      calories,
      proteinG,
      carbsG,
      fatG,
      fiberG,
      sugarG,
    },
    total: {
      ...totalBase,
      calories: calories * servings,
      proteinG: proteinG * servings,
      carbsG: carbsG * servings,
      fatG: fatG * servings,
    },
  };
};
