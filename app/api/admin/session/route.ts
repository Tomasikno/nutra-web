import { NextResponse } from "next/server";
import { clearSession, requireSession } from "../_supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await requireSession();
  if (!data) {
    await clearSession();
    return NextResponse.json({ email: null }, { status: 200 });
  }

  return NextResponse.json({ email: data.user.email ?? null });
}
