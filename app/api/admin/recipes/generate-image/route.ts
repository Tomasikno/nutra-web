import { NextResponse } from "next/server";
import { requireAdmin } from "../../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_INGREDIENTS = 50;
const MAX_NAME_LENGTH = 120;
const MAX_INGREDIENT_LENGTH = 80;

type GenerateImageRequest = {
  recipe_id?: string;
  dish_name: string;
  ingredients: string[];
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const getSupabaseUrl = () => process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

function validateRequest(body: GenerateImageRequest) {
  const errors: string[] = [];

  const dishName = body.dish_name?.trim();
  if (!dishName) {
    errors.push("dish_name is required.");
  } else if (dishName.length > MAX_NAME_LENGTH) {
    errors.push("dish_name is too long.");
  }

  if (!isStringArray(body.ingredients)) {
    errors.push("ingredients must be an array of strings.");
  } else if (body.ingredients.length === 0 || body.ingredients.length > MAX_INGREDIENTS) {
    errors.push("ingredients count is invalid.");
  } else {
    const invalid = body.ingredients.some((item) => {
      const trimmed = item.trim();
      return !trimmed || trimmed.length > MAX_INGREDIENT_LENGTH;
    });
    if (invalid) {
      errors.push("ingredients contain invalid values.");
    }
  }

  if (body.recipe_id && typeof body.recipe_id !== "string") {
    errors.push("recipe_id is invalid.");
  }

  return errors;
}

export async function POST(request: Request) {
  const sessionData = await requireAdmin();
  if (!sessionData) {
    return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  }

  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) {
    return NextResponse.json({ message: "Supabase URL not configured." }, { status: 500 });
  }

  const body = (await request.json()) as GenerateImageRequest;
  const errors = validateRequest(body);

  if (errors.length > 0) {
    return NextResponse.json({ message: "Invalid request payload.", errors }, { status: 400 });
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/recipe-image-generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sessionData.session.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipe_id: body.recipe_id,
      dish_name: body.dish_name.trim(),
      ingredients: body.ingredients.map((item) => item.trim()),
    }),
  });

  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    return NextResponse.json(
      { message: (payload.message as string) ?? "Image generation failed." },
      { status: response.status }
    );
  }

  return NextResponse.json(payload);
}
