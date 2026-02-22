import { defaultLocale, locales, type Locale } from "@/i18n/request";
import { getDefaultOgImage, getDefaultTwitterImage, getSiteOrigin } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: getSiteOrigin(),
  title: {
    default: "Nutra | Meal Planning and Nutrition Coach",
    template: "%s | Nutra",
  },
  description:
    "Plan meals, generate shopping lists, and get AI nutrition guidance tailored to your goals.",
  applicationName: "Nutra",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Nutra",
    url: "/",
    title: "Nutra | Meal Planning and Nutrition Coach",
    description:
      "Plan meals, generate shopping lists, and get AI nutrition guidance tailored to your goals.",
    images: [getDefaultOgImage()],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nutra | Meal Planning and Nutrition Coach",
    description:
      "Plan meals, generate shopping lists, and get AI nutrition guidance tailored to your goals.",
    images: [getDefaultTwitterImage()],
  },
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestLocale = await getLocale().catch(() => defaultLocale);
  const htmlLang = locales.includes(requestLocale as Locale) ? requestLocale : defaultLocale;
  const skipToMainContentLabel =
    htmlLang === "cs" ? "Přejít na hlavní obsah" : "Skip to main content";

  return (
    <html lang={htmlLang} className={`${plusJakartaSans.variable} ${fraunces.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-title" content="Nutra" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="antialiased">
        <a className="skip-link" href="#main-content">
          {skipToMainContentLabel}
        </a>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
