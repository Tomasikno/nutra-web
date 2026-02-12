import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin } from "../../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const getSupabaseUrl = () => process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * GET — returns recipes that have a photo but no thumbnail.
 */
export async function GET() {
  const sessionData = await requireAdmin();
  if (!sessionData) {
    return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ message: "Supabase admin client not configured." }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin
    .from("recipes")
    .select("id, photo_path")
    .not("photo_path", "is", null)
    .is("thumbnail_path", null)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ message: error.message || "Failed to query recipes." }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [], total: data?.length ?? 0 });
}

/**
 * POST — generate a thumbnail for a single recipe by proxying to the edge function.
 * Body: { recipe_id: string, photo_path: string }
 */
export async function POST(request: Request) {
  const sessionData = await requireAdmin();
  if (!sessionData) {
    return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  }

  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) {
    return NextResponse.json({ message: "Supabase URL not configured." }, { status: 500 });
  }

  const body = (await request.json()) as { recipe_id?: string; photo_path?: string };

  if (!body.recipe_id || typeof body.recipe_id !== "string") {
    return NextResponse.json({ message: "recipe_id is required." }, { status: 400 });
  }
  if (!body.photo_path || typeof body.photo_path !== "string") {
    return NextResponse.json({ message: "photo_path is required." }, { status: 400 });
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/recipe-photo-thumbnail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sessionData.session.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipe_id: body.recipe_id,
      photo_path: body.photo_path,
    }),
  });

  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    return NextResponse.json(
      { message: (payload.message as string) ?? "Thumbnail generation failed." },
      { status: response.status },
    );
  }

  return NextResponse.json(payload);
}
