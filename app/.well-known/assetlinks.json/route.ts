import { NextResponse } from "next/server";

/**
 * Android App Links — Digital Asset Links
 * Serves /.well-known/assetlinks.json for Android app link verification.
 *
 * Configure via env vars:
 *   ANDROID_PACKAGE_NAME  — e.g. "com.nutra"
 *   ANDROID_SHA256_CERT   — SHA-256 fingerprint of signing cert
 */
export async function GET() {
  const packageName = process.env.ANDROID_PACKAGE_NAME ?? "com.nutra";
  const sha256Cert = process.env.ANDROID_SHA256_CERT ?? "";

  const assetLinks = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: packageName,
        sha256_cert_fingerprints: sha256Cert ? [sha256Cert] : [],
      },
    },
  ];

  return NextResponse.json(assetLinks, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
