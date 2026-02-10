import type { MetadataRoute } from "next";
import { buildCanonicalUrl, getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/nutra-redaktor", "/nutra-redaktor/"],
      },
    ],
    sitemap: buildCanonicalUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
