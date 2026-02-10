import { NextResponse } from "next/server";
import { clearSession } from "../_supabase";

export const dynamic = "force-dynamic";

export async function POST() {
  await clearSession();
  return NextResponse.json({ success: true });
}
