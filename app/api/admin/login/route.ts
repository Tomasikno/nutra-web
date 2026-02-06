import { NextResponse } from "next/server";
import { getConfig, setSession } from "../_supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { url, serviceRoleKey } = getConfig();
  if (!url || !serviceRoleKey) {
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

  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: body.email,
      password: body.password,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    return NextResponse.json(
      { message: message || "Login failed." },
      { status: response.status }
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    user: { email: string | null };
  };

  await setSession({
    accessToken: data.access_token,
    email: data.user?.email ?? null,
  });

  return NextResponse.json({ email: data.user?.email ?? null });
}
