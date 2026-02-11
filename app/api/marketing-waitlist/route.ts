import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type WaitlistPayload = {
  email?: unknown;
  locale?: unknown;
};

function isValidEmail(email: string): boolean {
  return /^\S+@\S+\.\S+$/.test(email);
}

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Waitlist is unavailable right now." },
      { status: 500 }
    );
  }

  const body = (await request.json().catch(() => null)) as WaitlistPayload | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const locale = typeof body?.locale === "string" ? body.locale.trim().toLowerCase() : null;

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ message: "Please enter a valid email." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("marketing_waitlist")
    .insert({ email, locale });

  if (!error) {
    return NextResponse.json({ ok: true });
  }

  if (error.code === "23505") {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { message: "Could not join waitlist right now. Please try again." },
    { status: 500 }
  );
}
