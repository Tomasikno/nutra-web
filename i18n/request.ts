import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

export const locales = ["cs", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "cs";

export default getRequestConfig(async ({ locale }) => {
  const requested = hasLocale(locales, locale) ? locale : defaultLocale;

  return {
    locale: requested,
    messages: (await import(`../messages/${requested}.json`)).default,
  };
});

