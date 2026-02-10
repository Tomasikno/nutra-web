import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const recipeSelect =
  "id, recipe_name, description, servings, prep_time_minutes, cook_time_minutes, difficulty, " +
  "portion_size, ingredients, steps, nutrition, health_benefits, warnings, health_score, " +
  "dietary_tags, meal_categories, time_of_day, share_visibility, slug, language, " +
  "photo_url, created_at, updated_at";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Server not configured." },
      { status: 500 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("recipes")
    .select(recipeSelect)
    .eq("id", id)
    .is("deleted_at", null)
    .in("share_visibility", ["PUBLIC", "UNLISTED"])
    .single();

  if (error || !data) {
    return NextResponse.json({ message: "Recipe not found." }, { status: 404 });
  }

  return NextResponse.json({ data });
}
