import { NextResponse } from "next/server";
import { getConfig, getServiceHeaders, requireSession } from "../_supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const sessionData = await requireSession();
  if (!sessionData) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { url } = getConfig();
  const body = (await request.json()) as Record<string, unknown>;

  const response = await fetch(`${url}/rest/v1/recipes`, {
    method: "POST",
    headers: {
      ...getServiceHeaders(),
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text();
    return NextResponse.json(
      { message: message || "Failed to create recipe." },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json({ data });
}
