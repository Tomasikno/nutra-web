import { NextResponse } from "next/server";
import { getConfig, getServiceHeaders, requireSession } from "../_supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessionData = await requireSession();
  if (!sessionData) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { url } = getConfig();
  const response = await fetch(`${url}/rest/v1/premium_config?select=*`, {
    headers: getServiceHeaders(),
  });

  if (!response.ok) {
    const message = await response.text();
    return NextResponse.json(
      { message: message || "Failed to load premium config." },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json({ data });
}

export async function PATCH(request: Request) {
  const sessionData = await requireSession();
  if (!sessionData) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
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

  const { url } = getConfig();
  const value = encodeURIComponent(String(body.identifier.value));
  const response = await fetch(
    `${url}/rest/v1/premium_config?${body.identifier.column}=eq.${value}`,
    {
      method: "PATCH",
      headers: {
        ...getServiceHeaders(),
        Prefer: "return=representation",
      },
      body: JSON.stringify(body.payload),
    }
  );

  if (!response.ok) {
    const message = await response.text();
    return NextResponse.json(
      { message: message || "Failed to update premium config." },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json({ data });
}
