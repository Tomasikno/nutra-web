import { NextResponse } from "next/server";
import type { Database, Json } from "@/lib/database.types";
import { requireAdmin, supabaseAdmin } from "../_supabase";

export const dynamic = "force-dynamic";

type RecipeInsert = Database["public"]["Tables"]["recipes"]["Insert"];

type ValidationResult = {
  payload: Partial<RecipeInsert>;
  errors: string[];
};

const difficultyOptions = new Set(["EASY", "MEDIUM", "HARD"]);
const timeOfDayOptions = new Set(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isTimeOfDayArray = (
  value: unknown
): value is NonNullable<RecipeInsert["time_of_day"]> =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every((item) => typeof item === "string" && timeOfDayOptions.has(item));
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

const validateRecipePayload = (
  body: Record<string, unknown>,
  options: { partial: boolean }
): ValidationResult => {
  const errors: string[] = [];
  const payload: Partial<RecipeInsert> = {};

  const setIfPresent = <K extends keyof RecipeInsert>(key: K) => {
    if (key in body) {
      payload[key] = body[key] as RecipeInsert[K];
    }
  };

  const required = <K extends keyof RecipeInsert>(key: K, validator: (value: unknown) => boolean) => {
    const value = body[key as string];
    if (value === undefined || value === null) {
      if (!options.partial) {
        errors.push(`${String(key)} is required.`);
      }
      return;
    }
    if (!validator(value)) {
      errors.push(`${String(key)} is invalid.`);
      return;
    }
    payload[key] = value as RecipeInsert[K];
  };

  required("recipe_name", (value) => typeof value === "string" && value.trim().length > 0);
  required("description", (value) => typeof value === "string" && value.trim().length > 0);
  required("servings", (value) => isNumber(value) && value >= 1);
  required("prep_time_minutes", (value) => isNumber(value) && value >= 0);
  required("cook_time_minutes", (value) => isNumber(value) && value >= 0);
  required("difficulty", (value) => typeof value === "string" && difficultyOptions.has(value));
  required("ingredients", (value) => Array.isArray(value) && value.length > 0);
  required("steps", (value) => Array.isArray(value) && value.length > 0);
  required("nutrition", (value) => validateNutrition(value));
  required("health_score", (value) => isNumber(value) && value >= 0 && value <= 100);
  required("dietary_tags", (value) => isStringArray(value));
  required("time_of_day", (value) => isTimeOfDayArray(value));

  if ("portion_size" in body) {
    const value = body.portion_size;
    if (value !== null && typeof value !== "string") {
      errors.push("portion_size is invalid.");
    } else {
      payload.portion_size = value as RecipeInsert["portion_size"];
    }
  }

  if ("language" in body) {
    const value = body.language;
    if (value !== null && typeof value !== "string") {
      errors.push("language is invalid.");
    } else {
      payload.language = value as RecipeInsert["language"];
    }
  }

  if ("share_visibility" in body) {
    const validVisibility = ["PRIVATE", "UNLISTED", "PUBLIC"];
    if (typeof body.share_visibility !== "string" || !validVisibility.includes(body.share_visibility)) {
      errors.push("share_visibility must be PRIVATE, UNLISTED, or PUBLIC.");
    } else {
      payload.share_visibility = body.share_visibility as RecipeInsert["share_visibility"];
    }
  }

  if ("health_benefits" in body) {
    if (body.health_benefits !== null && !Array.isArray(body.health_benefits)) {
      errors.push("health_benefits must be an array.");
    } else {
      payload.health_benefits = body.health_benefits as Json;
    }
  }

  if ("warnings" in body) {
    if (body.warnings !== null && !Array.isArray(body.warnings)) {
      errors.push("warnings must be an array.");
    } else {
      payload.warnings = body.warnings as Json;
    }
  }

  setIfPresent("photo_path");
  setIfPresent("photo_url");
  setIfPresent("photo_width");
  setIfPresent("photo_height");
  setIfPresent("photo_size_bytes");
  setIfPresent("photo_moderation_status");
  setIfPresent("photo_moderated_at");

  return { payload, errors };
};

const recipeListSelect =
  "id, recipe_name, description, servings, prep_time_minutes, cook_time_minutes, difficulty, portion_size, ingredients, steps, nutrition, health_benefits, warnings, health_score, dietary_tags, time_of_day, share_visibility, slug, language, photo_path, photo_url, photo_width, photo_height, photo_size_bytes, photo_moderation_status, photo_moderated_at, created_by, created_at, updated_at, deleted_at";

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const includeDeleted = searchParams.get("include_deleted") === "true";
  const showAll = searchParams.get("show_all") === "true";
  const searchEmail = searchParams.get("search_email")?.trim() || "";
  const searchName = searchParams.get("search_name")?.trim() || "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.max(1, Math.min(100, Number(searchParams.get("page_size") ?? "20")));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from("recipes")
    .select(recipeListSelect, { count: "exact" })
    .order("created_at", {
    ascending: false,
  });

  if (!includeDeleted) {
    query = query.is("deleted_at", null);
  }

  // Filter by recipe name
  if (searchName) {
    query = query.ilike("recipe_name", `%${searchName}%`);
  }

  // Filter by user
  if (searchEmail) {
    // Look up user by email
    const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
    const matchingUser = userData?.users?.find(
      (u) => u.email?.toLowerCase().includes(searchEmail.toLowerCase())
    );
    if (matchingUser) {
      query = query.eq("created_by", matchingUser.id);
    } else {
      // No matching user found, return empty
      return NextResponse.json({
        data: [],
        currentUserId: sessionData.user.id,
        total: 0,
        page,
        pageSize,
      });
    }
  } else if (!showAll) {
    // Default: show only current user's recipes
    query = query.eq("created_by", sessionData.user.id);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return NextResponse.json(
      { message: error.message || "Failed to load recipes." },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({
      data: [],
      currentUserId: sessionData.user.id,
      total: 0,
      page,
      pageSize,
    });
  }

  // Fetch all users to map user IDs to emails
  const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
  const userEmailMap = new Map(
    userData?.users?.map((u) => [u.id, u.email ?? "Unknown"]) ?? []
  );

  // Add user_email to each recipe
  const recipesWithEmails = data.map((recipe) => ({
    ...recipe,
    user_email: userEmailMap.get(recipe.created_by) ?? "Unknown",
  }));

  return NextResponse.json({
    data: recipesWithEmails,
    currentUserId: sessionData.user.id,
    total: count ?? recipesWithEmails.length,
    page,
    pageSize,
  });
}

export async function POST(request: Request) {
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
  const { payload, errors } = validateRecipePayload(body, { partial: false });

  if (errors.length > 0) {
    return NextResponse.json({ message: "Invalid recipe payload.", errors }, { status: 400 });
  }

  payload.created_by = sessionData.user.id;

  const { data, error } = await supabaseAdmin
    .from("recipes")
    .insert(payload as RecipeInsert)
    .select(recipeListSelect)
    .single();

  if (error) {
    return NextResponse.json(
      { message: error.message || "Failed to create recipe." },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}
