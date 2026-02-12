import { NextResponse } from "next/server";
import { imageSize } from "image-size";
import { requireAdmin, supabaseAdmin } from "../../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const BUCKET_NAME = "recipe-photos";

const extensionForType = (type: string) => {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "bin";
  }
};

const getSupabaseUrl = () => process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

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

  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) {
    return NextResponse.json(
      { message: "Supabase URL not configured." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const recipeIdRaw = formData.get("recipe_id");
  const recipeId = typeof recipeIdRaw === "string" ? recipeIdRaw : null;

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ message: "File is required." }, { status: 400 });
  }

  if (!ACCEPTED_TYPES.has(file.type)) {
    return NextResponse.json({ message: "Unsupported file type." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ message: "File is too large." }, { status: 413 });
  }

  const extension = extensionForType(file.type);
  const folder = recipeId ? recipeId : `temp-${crypto.randomUUID()}`;
  const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const storagePath = `recipes/${folder}/${filename}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let photoWidth: number | null = null;
  let photoHeight: number | null = null;
  try {
    const dimensions = imageSize(buffer);
    photoWidth = typeof dimensions.width === "number" ? dimensions.width : null;
    photoHeight = typeof dimensions.height === "number" ? dimensions.height : null;
  } catch {
    photoWidth = null;
    photoHeight = null;
  }

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json(
      { message: uploadError.message || "Upload failed." },
      { status: 500 }
    );
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  const photoUrl = publicUrlData.publicUrl;

  let moderationStatus: string | null = null;
  let moderationPayload: Record<string, unknown> | null = null;

  try {
    const moderationResponse = await fetch(
      `${supabaseUrl}/functions/v1/recipe-photo-moderate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionData.session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_url: photoUrl, recipe_id: recipeId }),
      }
    );

    if (moderationResponse.ok) {
      const result = (await moderationResponse.json()) as {
        is_food?: boolean;
        confidence?: number;
        labels?: string[];
        reason?: string;
      };

      moderationStatus = result.is_food ? "approved" : "rejected";
      moderationPayload = result as Record<string, unknown>;
    } else {
      moderationStatus = "error";
    }
  } catch {
    moderationStatus = "error";
  }

  const photoModeratedAt = new Date().toISOString();

  if (recipeId) {
    const updatePayload: Record<string, unknown> = {
      photo_path: storagePath,
      photo_url: photoUrl,
      photo_width: photoWidth,
      photo_height: photoHeight,
      photo_size_bytes: file.size,
      photo_moderation_status: moderationStatus,
      photo_moderated_at: photoModeratedAt,
    };

    const { error: updateError } = await supabaseAdmin
      .from("recipes")
      .update(updatePayload)
      .eq("id", recipeId);

    if (updateError) {
      return NextResponse.json(
        { message: updateError.message || "Failed to save photo metadata." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    photo_path: storagePath,
    photo_url: photoUrl,
    photo_width: photoWidth,
    photo_height: photoHeight,
    photo_size_bytes: file.size,
    photo_moderation_status: moderationStatus,
    photo_moderated_at: photoModeratedAt,
    moderation: moderationPayload,
  });
}
