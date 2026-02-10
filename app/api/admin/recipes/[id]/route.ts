import { NextResponse } from "next/server";
import type { Database } from "@/lib/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin, supabaseAdmin } from "../../_supabase";

export const dynamic = "force-dynamic";

type RecipeUpdate = Database["public"]["Tables"]["recipes"]["Update"];

const difficultyOptions = new Set(["EASY", "MEDIUM", "HARD"]);
const timeOfDayOptions = new Set(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && !Number.isNaN(value);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNullableNumber = (value: unknown): value is number | null =>
  value === null || isNumber(value);

const validateNutrition = (value: unknown) => {
  if (!isObject(value)) return false;
  const nutrition = value as Record<string, unknown>;
  const flatKeys = ["calories", "protein", "carbs", "fat", "fiber", "sugar"];
  const hasFlat = flatKeys.every((key) => isNumber(nutrition[key]));
  if (hasFlat) return true;

  const perServingRaw = nutrition.perServing ?? nutrition.per_serving;
  const totalRaw = nutrition.total;
  if (!isObject(perServingRaw) || !isObject(totalRaw)) return false;

  const perServing = perServingRaw as Record<string, unknown>;
  const total = totalRaw as Record<string, unknown>;

  const perServingOk =
    isNumber(perServing.calories) &&
    isNumber(perServing.proteinG ?? perServing.protein_g ?? perServing.protein) &&
    isNumber(perServing.carbsG ?? perServing.carbs_g ?? perServing.carbs) &&
    isNumber(perServing.fatG ?? perServing.fat_g ?? perServing.fat) &&
    isNullableNumber(perServing.fiberG ?? perServing.fiber_g ?? perServing.fiber ?? null) &&
    isNullableNumber(perServing.sugarG ?? perServing.sugar_g ?? perServing.sugar ?? null);

  const totalOk =
    isNumber(total.calories) &&
    isNumber(total.proteinG ?? total.protein_g ?? total.protein) &&
    isNumber(total.carbsG ?? total.carbs_g ?? total.carbs) &&
    isNumber(total.fatG ?? total.fat_g ?? total.fat);

  return perServingOk && totalOk;
};

const sanitizeRecipeUpdate = (body: Record<string, unknown>) => {
  const errors: string[] = [];
  const payload: RecipeUpdate = {};

  const assign = <K extends keyof RecipeUpdate>(key: K) => {
    if (key in body) {
      payload[key] = body[key] as RecipeUpdate[K];
    }
  };

  if ("recipe_name" in body) {
    if (typeof body.recipe_name !== "string" || body.recipe_name.trim().length === 0) {
      errors.push("recipe_name is invalid.");
    } else {
      payload.recipe_name = body.recipe_name as string;
    }
  }

  if ("description" in body) {
    if (typeof body.description !== "string" || body.description.trim().length === 0) {
      errors.push("description is invalid.");
    } else {
      payload.description = body.description as string;
    }
  }

  if ("servings" in body) {
    if (!isNumber(body.servings) || body.servings < 1) {
      errors.push("servings is invalid.");
    } else {
      payload.servings = body.servings as number;
    }
  }

  if ("prep_time_minutes" in body) {
    if (!isNumber(body.prep_time_minutes) || body.prep_time_minutes < 0) {
      errors.push("prep_time_minutes is invalid.");
    } else {
      payload.prep_time_minutes = body.prep_time_minutes as number;
    }
  }

  if ("cook_time_minutes" in body) {
    if (!isNumber(body.cook_time_minutes) || body.cook_time_minutes < 0) {
      errors.push("cook_time_minutes is invalid.");
    } else {
      payload.cook_time_minutes = body.cook_time_minutes as number;
    }
  }

  if ("difficulty" in body) {
    if (typeof body.difficulty !== "string" || !difficultyOptions.has(body.difficulty)) {
      errors.push("difficulty is invalid.");
    } else {
      payload.difficulty = body.difficulty as RecipeUpdate["difficulty"];
    }
  }

  if ("ingredients" in body) {
    if (!Array.isArray(body.ingredients) || body.ingredients.length === 0) {
      errors.push("ingredients is invalid.");
    } else {
      payload.ingredients = body.ingredients as RecipeUpdate["ingredients"];
    }
  }

  if ("steps" in body) {
    if (!Array.isArray(body.steps) || body.steps.length === 0) {
      errors.push("steps is invalid.");
    } else {
      payload.steps = body.steps as RecipeUpdate["steps"];
    }
  }

  if ("nutrition" in body) {
    if (!validateNutrition(body.nutrition)) {
      errors.push("nutrition is invalid.");
    } else {
      payload.nutrition = body.nutrition as RecipeUpdate["nutrition"];
    }
  }

  if ("health_score" in body) {
    if (!isNumber(body.health_score) || body.health_score < 0 || body.health_score > 100) {
      errors.push("health_score is invalid.");
    } else {
      payload.health_score = body.health_score as number;
    }
  }

  if ("dietary_tags" in body) {
    if (!isStringArray(body.dietary_tags)) {
      errors.push("dietary_tags is invalid.");
    } else {
      payload.dietary_tags = body.dietary_tags as string[];
    }
  }

  if ("meal_categories" in body) {
    if (!isStringArray(body.meal_categories)) {
      errors.push("meal_categories is invalid.");
    } else {
      payload.meal_categories = body.meal_categories as string[];
    }
  }

  if ("time_of_day" in body) {
    const value = body.time_of_day;
    if (value !== null && typeof value !== "string") {
      errors.push("time_of_day is invalid.");
    } else if (typeof value === "string" && !timeOfDayOptions.has(value)) {
      errors.push("time_of_day is invalid.");
    } else {
      payload.time_of_day = value as RecipeUpdate["time_of_day"];
    }
  }

  if ("portion_size" in body) {
    const value = body.portion_size;
    if (value !== null && typeof value !== "string") {
      errors.push("portion_size is invalid.");
    } else {
      payload.portion_size = value as RecipeUpdate["portion_size"];
    }
  }

  if ("language" in body) {
    const value = body.language;
    if (value !== null && typeof value !== "string") {
      errors.push("language is invalid.");
    } else {
      payload.language = value as RecipeUpdate["language"];
    }
  }

  if ("share_visibility" in body) {
    const validVisibility = ["PRIVATE", "UNLISTED", "PUBLIC"];
    if (typeof body.share_visibility !== "string" || !validVisibility.includes(body.share_visibility)) {
      errors.push("share_visibility must be PRIVATE, UNLISTED, or PUBLIC.");
    } else {
      payload.share_visibility = body.share_visibility as RecipeUpdate["share_visibility"];
    }
  }

  if ("health_benefits" in body) {
    if (body.health_benefits !== null && !Array.isArray(body.health_benefits)) {
      errors.push("health_benefits is invalid.");
    } else {
      payload.health_benefits = body.health_benefits as RecipeUpdate["health_benefits"];
    }
  }

  if ("warnings" in body) {
    if (body.warnings !== null && !Array.isArray(body.warnings)) {
      errors.push("warnings is invalid.");
    } else {
      payload.warnings = body.warnings as RecipeUpdate["warnings"];
    }
  }

  assign("photo_path");
  assign("photo_url");
  assign("photo_width");
  assign("photo_height");
  assign("photo_size_bytes");
  assign("photo_moderation_status");
  assign("photo_moderated_at");

  return { payload, errors };
};

const recipeSelect =
  "id, recipe_name, description, servings, prep_time_minutes, cook_time_minutes, difficulty, portion_size, ingredients, steps, nutrition, health_benefits, warnings, health_score, dietary_tags, meal_categories, time_of_day, share_visibility, slug, language, photo_path, photo_url, photo_width, photo_height, photo_size_bytes, photo_moderation_status, photo_moderated_at, created_by, created_at, updated_at, deleted_at, embedding";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionData = await requireAdmin();
  if (!sessionData) {
    return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Supabase admin client not configured." },
      { status: 500 }
    );
  }

  const client = supabaseAdmin as SupabaseClient<Database>;
  const { data, error } = await client
    .from("recipes")
    .select(recipeSelect)
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json(
      { message: error.message || "Recipe not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionData = await requireAdmin();
  if (!sessionData) {
    return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Supabase admin client not configured." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as Record<string, unknown>;
  const { payload, errors } = sanitizeRecipeUpdate(body);

  if (errors.length > 0) {
    return NextResponse.json({ message: "Invalid recipe payload.", errors }, { status: 400 });
  }

  const client = supabaseAdmin as SupabaseClient<Database>;
  const { data, error } = await client
    .from("recipes")
    .update(payload)
    .eq("id", id)
    .select(recipeSelect)
    .single();

  if (error) {
    return NextResponse.json(
      { message: error.message || "Failed to update recipe." },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionData = await requireAdmin();
  if (!sessionData) {
    return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Supabase admin client not configured." },
      { status: 500 }
    );
  }

  const client = supabaseAdmin as SupabaseClient<Database>;
  const { data, error } = await client
    .from("recipes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, recipe_name, deleted_at")
    .single();

  if (error) {
    return NextResponse.json(
      { message: error.message || "Failed to delete recipe." },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}
