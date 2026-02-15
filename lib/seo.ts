const DEFAULT_SITE_URL = "http://localhost:3000";
const DEFAULT_OG_IMAGE_PATH = "/opengraph-image";
const DEFAULT_TWITTER_IMAGE_PATH = "/twitter-image";
const DEFAULT_SOCIAL_IMAGE_ALT = "Nutra | Meal planning and nutrition coach";

const OG_LOCALE_BY_LOCALE = {
  cs: "cs_CZ",
  en: "en_US",
} as const;

function normalizeSiteUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_SITE_URL;

  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

  return withProtocol.replace(/\/+$/, "");
}

export function getSiteUrl(): string {
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;

  return normalizeSiteUrl(candidate ?? DEFAULT_SITE_URL);
}

export function getSiteOrigin(): URL {
  return new URL(getSiteUrl());
}

export function buildCanonicalUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, getSiteOrigin()).toString();
}

export function getDefaultOgImage() {
  return {
    url: buildCanonicalUrl(DEFAULT_OG_IMAGE_PATH),
    width: 1200,
    height: 630,
    alt: DEFAULT_SOCIAL_IMAGE_ALT,
  };
}

export function getDefaultTwitterImage() {
  return {
    url: buildCanonicalUrl(DEFAULT_TWITTER_IMAGE_PATH),
    alt: DEFAULT_SOCIAL_IMAGE_ALT,
  };
}

export function resolveOgLocale(locale: string): (typeof OG_LOCALE_BY_LOCALE)[keyof typeof OG_LOCALE_BY_LOCALE] {
  return OG_LOCALE_BY_LOCALE[locale as keyof typeof OG_LOCALE_BY_LOCALE] ?? OG_LOCALE_BY_LOCALE.cs;
}

export function resolveOgAlternateLocales(
  locale: string
): Array<(typeof OG_LOCALE_BY_LOCALE)[keyof typeof OG_LOCALE_BY_LOCALE]> {
  const current = resolveOgLocale(locale);
  return Object.values(OG_LOCALE_BY_LOCALE).filter((value) => value !== current);
}
