import { NextResponse } from "next/server";
import type { Database } from "@/lib/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin, supabaseAdmin } from "../../_supabase";

export const dynamic = "force-dynamic";

type BulkAction = "set_private" | "set_unlisted" | "set_public" | "delete" | "generate_images";

type BulkPayload = {
  action?: BulkAction;
  recipeIds?: string[];
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const MAX_INGREDIENTS = 50;
const MAX_INGREDIENT_LENGTH = 80;

const getSupabaseUrl = () => process.env.SUPABASE_URL;

const ingredientStringsFromRaw = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      const ingredient = item as { name?: string; amount?: string; unit?: string };
      const parts = [ingredient.amount, ingredient.unit, ingredient.name]
        .filter((value) => typeof value === "string" && value.trim())
        .map((value) => value!.trim());
      return parts.join(" ");
    })
    .filter((value) => value.length > 0);
};

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

  const body = (await request.json()) as BulkPayload;
  const action = body.action;
  const recipeIds = body.recipeIds ?? [];

  if (!action || !["set_private", "set_unlisted", "set_public", "delete", "generate_images"].includes(action)) {
    return NextResponse.json({ message: "Invalid bulk action." }, { status: 400 });
  }

  if (!isStringArray(recipeIds) || recipeIds.length === 0) {
    return NextResponse.json({ message: "Recipe IDs are required." }, { status: 400 });
  }

  const client = supabaseAdmin as SupabaseClient<Database>;

  if (action === "delete") {
    const { error, count } = await client
      .from("recipes")
      .delete({ count: "exact" })
      .in("id", recipeIds);

    if (error) {
      return NextResponse.json(
        { message: error.message || "Failed to delete recipes." },
        { status: 500 }
      );
    }

    return NextResponse.json({ deleted: count ?? recipeIds.length });
  }

  if (action === "generate_images") {
    const supabaseUrl = getSupabaseUrl();
    if (!supabaseUrl) {
      return NextResponse.json(
        { message: "Supabase URL not configured." },
        { status: 500 }
      );
    }

    const { data: recipes, error } = await client
      .from("recipes")
      .select("id, recipe_name, ingredients, photo_url")
      .in("id", recipeIds);

    if (error || !recipes) {
      return NextResponse.json(
        { message: error?.message || "Failed to load recipes." },
        { status: 500 }
      );
    }

    let generated = 0;
    let skippedExisting = 0;
    let skippedInvalid = 0;
    const failed: Array<{ id: string; message: string }> = [];

    for (const recipe of recipes) {
      if (recipe.photo_url) {
        skippedExisting += 1;
        continue;
      }

      const dishName = recipe.recipe_name?.trim();
      const ingredients = ingredientStringsFromRaw(recipe.ingredients)
        .slice(0, MAX_INGREDIENTS)
        .filter((item) => item.length <= MAX_INGREDIENT_LENGTH);

      if (!dishName || ingredients.length === 0) {
        skippedInvalid += 1;
        continue;
      }

      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/recipe-image-generate`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionData.session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipe_id: recipe.id,
            dish_name: dishName,
            ingredients,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json()) as { message?: string };
          failed.push({
            id: recipe.id,
            message: payload.message ?? "Image generation failed.",
          });
          continue;
        }

        generated += 1;
      } catch (err) {
        failed.push({
          id: recipe.id,
          message: err instanceof Error ? err.message : "Image generation failed.",
        });
      }
    }

    const summary = `Generated ${generated}, skipped existing ${skippedExisting}, skipped invalid ${skippedInvalid}, failed ${failed.length}.`;

    return NextResponse.json({
      generated,
      skipped_existing: skippedExisting,
      skipped_invalid: skippedInvalid,
      failed,
      summary,
    });
  }

  const visibilityMap = {
    set_private: "PRIVATE",
    set_unlisted: "UNLISTED",
    set_public: "PUBLIC",
  } as const;

  const { error, count } = await client
    .from("recipes")
    .update({ share_visibility: visibilityMap[action] })
    .in("id", recipeIds);

  if (error) {
    return NextResponse.json(
      { message: error.message || "Failed to update recipes." },
      { status: 500 }
    );
  }

  return NextResponse.json({ updated: count ?? recipeIds.length });
}
