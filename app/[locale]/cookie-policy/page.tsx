import { defaultLocale, locales, type Locale } from "@/i18n/request";
import {
  buildCanonicalUrl,
  getDefaultOgImage,
  getDefaultTwitterImage,
  resolveOgAlternateLocales,
  resolveOgLocale,
} from "@/lib/seo";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import Link from "next/link";
import { notFound } from "next/navigation";

type CookiePolicyParams = {
  locale: string;
};

type CookiePolicyPageProps = {
  params: Promise<CookiePolicyParams>;
};

type CookiePolicyContent = {
  title: string;
  description: string;
  heading: string;
  intro: string;
  sectionWhatTitle: string;
  sectionWhatParagraphs: string[];
  sectionCurrentTitle: string;
  cookieCardTitle: string;
  cookieItems: string[];
  sectionAnalyticsTitle: string;
  sectionAnalyticsParagraphs: string[];
  sectionManageTitle: string;
  sectionManageItems: string[];
  sectionUpdatesTitle: string;
  sectionUpdatesParagraph: string;
  relatedPrivacyPrefix: string;
  relatedPrivacyLinkLabel: string;
  relatedPrivacySuffix: string;
  effectiveDateLabel: string;
  effectiveDate: string;
  effectiveDateSuffix: string;
};

const cookiePolicyContent: Record<Locale, CookiePolicyContent> = {
  cs: {
    title: "Nutra - Zasady cookies",
    description:
      "Prakticke informace o cookies na webu Nutra, vcetne aktualne pouzivanych cookies a jejich ucelu.",
    heading: "Zasady cookies",
    intro:
      "Tato stranka vysvetluje, jak web Nutra pouziva cookies a podobne technologie. Popisujeme, ktere cookies jsou aktivni, proc je pouzivame a jak je muzete spravovat.",
    sectionWhatTitle: "1. Co jsou cookies",
    sectionWhatParagraphs: [
      "Cookies jsou male textove soubory, ktere web uklada do vaseho prohlizece.",
      "Pomahaji nam zajistit bezpecne prihlaseni, stabilitu sluzby a zakladni funkcnost webu.",
    ],
    sectionCurrentTitle: "2. Cookies, ktere aktualne pouzivame",
    cookieCardTitle: "Strictly necessary cookie",
    cookieItems: [
      "Nazev: nutra-admin-session",
      "Vlastnik: first-party (Nutra)",
      "Ucel: autentizace a udrzeni administratorske session",
      "Typ: HTTP-only session cookie",
      "Zivotnost: do odhlaseni nebo ukonceni relace",
      "Atributy: HttpOnly, SameSite=Lax, Secure (v produkci), Path=/",
    ],
    sectionAnalyticsTitle: "3. Analytics",
    sectionAnalyticsParagraphs: [
      "Na verejne casti webu je aktivni Vercel Analytics pro agregovane metriky navstevnosti a vykonu.",
      "Podle aktualni implementace nepouzivame na domene Nutra analytics cookies pro tento nastroj.",
    ],
    sectionManageTitle: "4. Jak cookies spravovat",
    sectionManageItems: [
      "Cookies muzete kontrolovat nebo mazat v nastaveni vaseho prohlizece.",
      "Pokud zablokujete nezbytne cookies, nektere casti webu (napr. admin prihlaseni) nemusi fungovat spravne.",
      "Nastaveni je mozne menit kdykoli, obvykle v sekci Privacy nebo Security vaseho prohlizece.",
    ],
    sectionUpdatesTitle: "5. Aktualizace dokumentu",
    sectionUpdatesParagraph:
      "Tyto zasady muzeme aktualizovat pri zmene funkcionality webu, pravnich pozadavku nebo poskytovatelu sluzeb.",
    relatedPrivacyPrefix: "Dalsi informace o zpracovani osobnich udaju najdete v dokumentu ",
    relatedPrivacyLinkLabel: "Privacy Policy",
    relatedPrivacySuffix: ".",
    effectiveDateLabel: "Ucinnost dokumentu:",
    effectiveDate: "15. unora 2026",
    effectiveDateSuffix: "Tento dokument muze byt aktualizovan.",
  },
  en: {
    title: "Nutra - Cookie Policy",
    description:
      "Practical information about cookies used on the Nutra website, including currently active cookies and purposes.",
    heading: "Cookie Policy",
    intro:
      "This page explains how the Nutra website uses cookies and similar technologies. It describes which cookies are currently active, why we use them, and how you can manage them.",
    sectionWhatTitle: "1. What cookies are",
    sectionWhatParagraphs: [
      "Cookies are small text files stored by websites in your browser.",
      "They help provide secure sign-in, service stability, and core website functionality.",
    ],
    sectionCurrentTitle: "2. Cookies we currently use",
    cookieCardTitle: "Strictly necessary cookie",
    cookieItems: [
      "Name: nutra-admin-session",
      "Owner: first-party (Nutra)",
      "Purpose: admin authentication and session continuity",
      "Type: HTTP-only session cookie",
      "Lifetime: until logout or end of session",
      "Attributes: HttpOnly, SameSite=Lax, Secure (in production), Path=/",
    ],
    sectionAnalyticsTitle: "3. Analytics",
    sectionAnalyticsParagraphs: [
      "Vercel Analytics is enabled on the public website for aggregated traffic and performance metrics.",
      "Based on the current implementation, no analytics cookies are set on the Nutra domain for this tool.",
    ],
    sectionManageTitle: "4. How to manage cookies",
    sectionManageItems: [
      "You can review and delete cookies in your browser settings.",
      "If you block strictly necessary cookies, parts of the website (such as admin sign-in) may not work properly.",
      "You can update these settings at any time, usually in your browser Privacy or Security section.",
    ],
    sectionUpdatesTitle: "5. Policy updates",
    sectionUpdatesParagraph:
      "We may update this policy when website functionality, legal requirements, or service providers change.",
    relatedPrivacyPrefix: "For more information about personal data processing, see the ",
    relatedPrivacyLinkLabel: "Privacy Policy",
    relatedPrivacySuffix: ".",
    effectiveDateLabel: "Effective date:",
    effectiveDate: "February 15, 2026",
    effectiveDateSuffix: "This document may be updated.",
  },
};

export function generateStaticParams(): CookiePolicyParams[] {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: CookiePolicyPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locales, locale)) notFound();

  const resolvedLocale = locale as Locale;
  const content = cookiePolicyContent[resolvedLocale];
  const canonicalPath = `/${resolvedLocale}/cookie-policy`;

  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical: buildCanonicalUrl(canonicalPath),
      languages: {
        cs: buildCanonicalUrl("/cs/cookie-policy"),
        en: buildCanonicalUrl("/en/cookie-policy"),
        "x-default": buildCanonicalUrl(`/${defaultLocale}/cookie-policy`),
      },
    },
    openGraph: {
      type: "article",
      url: buildCanonicalUrl(canonicalPath),
      title: content.title,
      description: content.description,
      locale: resolveOgLocale(resolvedLocale),
      alternateLocale: resolveOgAlternateLocales(resolvedLocale),
      images: [getDefaultOgImage()],
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.description,
      images: [getDefaultTwitterImage()],
    },
  };
}

export default async function CookiePolicyPage({ params }: CookiePolicyPageProps) {
  const { locale } = await params;
  if (!hasLocale(locales, locale)) notFound();

  const resolvedLocale = locale as Locale;
  const content = cookiePolicyContent[resolvedLocale];

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-6 py-14 text-foreground lg:px-10 lg:py-20">
      <div className="rounded-3xl border border-forest-green/20 bg-white/85 p-7 shadow-[0_20px_55px_-35px_rgba(28,51,37,0.65)] backdrop-blur-sm sm:p-10">
        <p className="mb-4 inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
          Nutra
        </p>
        <h1 className="display-type text-4xl font-bold text-forest-green sm:text-5xl">{content.heading}</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-700">{content.intro}</p>

        <section className="mt-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-forest-green">{content.sectionWhatTitle}</h2>
          {content.sectionWhatParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <section className="mt-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-forest-green">{content.sectionCurrentTitle}</h2>
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 sm:p-6">
            <h3 className="text-lg font-semibold text-forest-green">{content.cookieCardTitle}</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              {content.cookieItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-forest-green">{content.sectionAnalyticsTitle}</h2>
          {content.sectionAnalyticsParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <section className="mt-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-forest-green">{content.sectionManageTitle}</h2>
          <ul className="list-disc space-y-2 pl-5">
            {content.sectionManageItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-forest-green">{content.sectionUpdatesTitle}</h2>
          <p>{content.sectionUpdatesParagraph}</p>
          <p>
            {content.relatedPrivacyPrefix}
            <Link
              className="font-semibold text-primary underline-offset-4 hover:underline"
              href={`/${resolvedLocale}/privacy-policy`}
            >
              {content.relatedPrivacyLinkLabel}
            </Link>
            {content.relatedPrivacySuffix}
          </p>
        </section>

        <p className="mt-12 border-t border-slate-200 pt-5 text-sm text-slate-600">
          {content.effectiveDateLabel} {content.effectiveDate}. {content.effectiveDateSuffix}
        </p>
      </div>
    </main>
  );
}
