import { NextResponse } from "next/server";

/**
 * iOS Universal Links — Apple App Site Association
 * Serves /.well-known/apple-app-site-association for iOS deep link verification.
 *
 * Configure via env vars:
 *   IOS_APP_ID — format: "TEAMID.com.nutra.app"
 */
export async function GET() {
  const appId = process.env.IOS_APP_ID ?? "TEAMID.com.nutra.app";

  const aasa = {
    applinks: {
      apps: [],
      details: [
        {
          appIDs: [appId],
          paths: ["/r/*"],
        },
      ],
    },
  };

  return NextResponse.json(aasa, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
