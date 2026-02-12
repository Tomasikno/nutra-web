import { checkRateLimit } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type WaitlistPayload = {
  email?: string;
  source?: string;
  locale?: string;
};

function isValidEmail(email: string): boolean {
  return /^\S+@\S+\.\S+$/.test(email);
}

async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Waitlist is unavailable right now." },
      { status: 500 },
    );
  }

  const ip = await getClientIp();

  const ipLimit = await checkRateLimit(ip, "waitlist-ip", 5, "10 m");
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { message: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as WaitlistPayload | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const localeValue = typeof body?.locale === "string" ? body.locale.trim().toLowerCase() : "";
  const sourceValue = typeof body?.source === "string" ? body.source.trim() : "";
  const locale = localeValue.length > 0 ? localeValue : null;
  const source = sourceValue.length > 0 ? sourceValue : null;

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ message: "Please enter a valid email." }, { status: 400 });
  }

  const emailLimit = await checkRateLimit(email, "waitlist-email", 3, "1 h");
  if (!emailLimit.allowed) {
    return NextResponse.json(
      { message: "Too many requests for this email. Please try again later." },
      { status: 429 },
    );
  }

  const { error } = await supabaseAdmin
    .from("marketing_waitlist")
    .insert({ email, locale, source });

  if (!error) {
    return NextResponse.json({ ok: true });
  }

  if (error.code === "23505") {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { message: "Could not join waitlist right now. Please try again." },
    { status: 500 },
  );
}
