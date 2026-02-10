import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
<<<<<<< HEAD
import { getSiteOrigin } from "@/lib/seo";
=======
import { Analytics } from "@vercel/analytics/next";
>>>>>>> 3b58ca09d40d43120b99bbb347ec0d537a6339af
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
    images: [
      {
        url: "/logo.png",
        alt: "Nutra logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nutra | Meal Planning and Nutrition Coach",
    description:
      "Plan meals, generate shopping lists, and get AI nutrition guidance tailored to your goals.",
    images: ["/logo.png"],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${plusJakartaSans.variable} ${fraunces.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-title" content="Nutra" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
