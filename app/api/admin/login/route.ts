import { NextResponse } from "next/server";
import { isAdminUser, isConfigured, setSession, supabaseAdmin } from "../_supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isConfigured() || !supabaseAdmin) {
    return NextResponse.json(
      { message: "Supabase is not configured." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as { email?: string; password?: string };
  if (!body.email || !body.password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });

  if (error || !data.session) {
    return NextResponse.json(
      { message: error?.message || "Login failed." },
      { status: 401 }
    );
  }

  if (!isAdminUser({ id: data.user.id, email: data.user.email ?? null })) {
    return NextResponse.json(
      { message: "Not authorized for admin access." },
      { status: 403 }
    );
  }

  await setSession({
    accessToken: data.session.access_token,
    email: data.user?.email ?? null,
  });

  return NextResponse.json({ email: data.user?.email ?? null });
}
