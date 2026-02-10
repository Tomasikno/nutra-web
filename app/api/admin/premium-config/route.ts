import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin } from "../_supabase";

export const dynamic = "force-dynamic";

export async function GET() {
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

  const { data, error } = await supabaseAdmin
    .from("premium_config")
    .select("*");

  if (error) {
    return NextResponse.json(
      { message: error.message || "Failed to load premium config." },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: Request) {
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

  const body = (await request.json()) as {
    identifier?: { column: string; value: string | number };
    payload?: Record<string, unknown>;
  };

  if (!body.identifier || !body.payload) {
    return NextResponse.json(
      { message: "Identifier and payload are required." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("premium_config")
    .update(body.payload)
    .eq(body.identifier.column, body.identifier.value)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { message: error.message || "Failed to update premium config." },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
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

  const body = (await request.json()) as {
    feature_slug?: string;
    display_name?: string;
    free_monthly_limit?: number;
    is_premium_only?: boolean;
  };

  if (!body.feature_slug || !body.display_name) {
    return NextResponse.json(
      { message: "feature_slug and display_name are required." },
      { status: 400 }
    );
  }

  const payload = {
    feature_slug: body.feature_slug.trim(),
    display_name: body.display_name.trim(),
    free_monthly_limit: body.free_monthly_limit ?? 5,
    is_premium_only: body.is_premium_only ?? false,
  };

  const { data, error } = await supabaseAdmin
    .from("premium_config")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { message: error.message || "Failed to create premium config." },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}
