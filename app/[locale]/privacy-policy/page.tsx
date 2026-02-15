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

type PrivacyPolicyParams = {
  locale: string;
};

type PrivacyPolicyPageProps = {
  params: Promise<PrivacyPolicyParams>;
};

type PrivacyPolicyContent = {
  title: string;
  description: string;
  heading: string;
  intro: string;
  sectionControllerTitle: string;
  sectionControllerParagraphs: string[];
  sectionDataTitle: string;
  sectionDataItems: string[];
  sectionPurposeTitle: string;
  sectionPurposeItems: string[];
  sectionSharingTitle: string;
  sectionSharingParagraph: string;
  sectionRetentionTitle: string;
  sectionRetentionItems: string[];
  sectionRightsTitle: string;
  sectionRightsParagraph: string;
  sectionRightsDeletionPrefix: string;
  sectionRightsDeletionLinkLabel: string;
  sectionRightsDeletionSuffix: string;
  effectiveDateLabel: string;
  effectiveDate: string;
  effectiveDateSuffix: string;
};

const privacyPolicyContent: Record<Locale, PrivacyPolicyContent> = {
  cs: {
    title: "Nutra - Zásady ochrany soukromí",
    description:
      "Zásady ochrany osobních údajů aplikace Nutra včetně rozsahu zpracování, retence a práv uživatelů.",
    heading: "Zásady ochrany osobních údajů",
    intro:
      "Tento dokument popisuje, jak aplikace Nutra zpracovává osobní údaje, jaké kategorie dat používá, jak dlouho jsou data uchovávána a jaká práva lze uplatnit.",
    sectionControllerTitle: "1. Správce a kontakt",
    sectionControllerParagraphs: [
      "Správcem osobních údajů je vývojář aplikace Nutra uvedený v záznamu aplikace na Google Play.",
      "Kontakt pro žádosti k osobním údajům (přístup, oprava, výmaz) je uveden v sekci vývojáře na Google Play.",
    ],
    sectionDataTitle: "2. Jaké údaje se zpracovávají",
    sectionDataItems: [
      "identifikační a přihlašovací údaje (např. e-mail, technické ID uživatele),",
      "profilové údaje a cíle související s výživou,",
      "záznamy o jídlech, receptech, oblíbených položkách a nastaveních,",
      "technické a bezpečnostní logy potřebné pro provoz a ochranu služby,",
      "údaje o předplatném poskytované partnery pro platby a entitlement.",
    ],
    sectionPurposeTitle: "3. Účely zpracování",
    sectionPurposeItems: [
      "provoz uživatelského účtu a funkcí aplikace,",
      "synchronizace a zálohování uživatelských dat mezi zařízeními,",
      "personalizace doporučení a analytických funkcí v aplikaci,",
      "zabezpečení, prevence zneužití a řešení technických incidentů,",
      "splnění právních povinností souvisejících s provozem služby.",
    ],
    sectionSharingTitle: "4. Sdílení dat",
    sectionSharingParagraph:
      "Data mohou být zpracovávána smluvními zpracovateli, kteří zajišťují technický provoz aplikace, databázové služby, AI funkce a předplatné. Tito zpracovatelé zpracovávají data pouze v rozsahu potřebném pro poskytování služby.",
    sectionRetentionTitle: "5. Doba uchovávání dat",
    sectionRetentionItems: [
      "uživatelská data jsou uchovávána po dobu existence účtu nebo do jejich výmazu,",
      "bezpečnostní logy jsou typicky uchovávány maximálně 30 dnů,",
      "zálohy mohou uchovávat data 30 až 90 dnů,",
      "údaje, které je správce povinen uchovávat ze zákona, jsou drženy po zákonem stanovenou dobu.",
    ],
    sectionRightsTitle: "6. Vaše práva",
    sectionRightsParagraph:
      "Uživatel má právo na přístup k osobním údajům, opravu, omezení zpracování, přenositelnost a výmaz. Dále má právo podat stížnost u příslušného dozorového úřadu.",
    sectionRightsDeletionPrefix: "O smazání účtu a přidružených dat lze požádat podle postupu na stránce ",
    sectionRightsDeletionLinkLabel: "Smazání účtu",
    sectionRightsDeletionSuffix: ".",
    effectiveDateLabel: "Účinnost dokumentu:",
    effectiveDate: "10. února 2026",
    effectiveDateSuffix: "Tento dokument může být aktualizován.",
  },
  en: {
    title: "Nutra - Privacy Policy",
    description:
      "Nutra privacy policy covering data processing scope, retention periods, and user rights.",
    heading: "Privacy Policy",
    intro:
      "This document explains how Nutra processes personal data, which categories of data are used, how long data is retained, and what rights users can exercise.",
    sectionControllerTitle: "1. Controller and contact",
    sectionControllerParagraphs: [
      "The controller of personal data is the Nutra app developer listed in the app listing on Google Play.",
      "Contact details for personal data requests (access, correction, deletion) are available in the developer section on Google Play.",
    ],
    sectionDataTitle: "2. What data is processed",
    sectionDataItems: [
      "identification and sign-in data (e.g. email, technical user ID),",
      "profile data and nutrition-related goals,",
      "records of meals, recipes, favorites, and settings,",
      "technical and security logs required for operation and service protection,",
      "subscription data provided by payment and entitlement partners.",
    ],
    sectionPurposeTitle: "3. Processing purposes",
    sectionPurposeItems: [
      "operating user accounts and app features,",
      "synchronizing and backing up user data across devices,",
      "personalizing recommendations and in-app analytics features,",
      "security, abuse prevention, and incident resolution,",
      "compliance with legal obligations related to service operation.",
    ],
    sectionSharingTitle: "4. Data sharing",
    sectionSharingParagraph:
      "Data may be processed by contracted processors that provide app infrastructure, database services, AI features, and subscriptions. These processors only process data to the extent necessary to deliver the service.",
    sectionRetentionTitle: "5. Data retention period",
    sectionRetentionItems: [
      "user data is retained for the lifetime of the account or until deleted,",
      "security logs are typically retained for up to 30 days,",
      "backups may retain data for 30 to 90 days,",
      "data that must be retained by law is kept for the legally required period.",
    ],
    sectionRightsTitle: "6. Your rights",
    sectionRightsParagraph:
      "Users have the right to access, correct, restrict processing, transfer, and erase personal data. Users also have the right to lodge a complaint with the competent supervisory authority.",
    sectionRightsDeletionPrefix: "To request account and related data deletion, follow the process on the ",
    sectionRightsDeletionLinkLabel: "Account Deletion",
    sectionRightsDeletionSuffix: " page.",
    effectiveDateLabel: "Effective date:",
    effectiveDate: "February 10, 2026",
    effectiveDateSuffix: "This document may be updated.",
  },
};

export function generateStaticParams(): PrivacyPolicyParams[] {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PrivacyPolicyPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locales, locale)) notFound();

  const resolvedLocale = locale as Locale;
  const content = privacyPolicyContent[resolvedLocale];
  const canonicalPath = `/${resolvedLocale}/privacy-policy`;

  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical: buildCanonicalUrl(canonicalPath),
      languages: {
        cs: buildCanonicalUrl("/cs/privacy-policy"),
        en: buildCanonicalUrl("/en/privacy-policy"),
        "x-default": buildCanonicalUrl(`/${defaultLocale}/privacy-policy`),
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

export default async function PrivacyPolicyPage({ params }: PrivacyPolicyPageProps) {
  const { locale } = await params;
  if (!hasLocale(locales, locale)) notFound();

  const resolvedLocale = locale as Locale;
  const content = privacyPolicyContent[resolvedLocale];

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-6 py-14 text-foreground lg:px-10 lg:py-20">
      <div className="rounded-3xl border border-forest-green/20 bg-white/85 p-7 shadow-[0_20px_55px_-35px_rgba(28,51,37,0.65)] backdrop-blur-sm sm:p-10">
        <p className="mb-4 inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
          Nutra
        </p>
        <h1 className="display-type text-4xl font-bold text-forest-green sm:text-5xl">{content.heading}</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-700">{content.intro}</p>

        <section className="mt-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-forest-green">{content.sectionControllerTitle}</h2>
          {content.sectionControllerParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <section className="mt-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-forest-green">{content.sectionDataTitle}</h2>
          <ul className="list-disc space-y-2 pl-5">
            {content.sectionDataItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-forest-green">{content.sectionPurposeTitle}</h2>
          <ul className="list-disc space-y-2 pl-5">
            {content.sectionPurposeItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-forest-green">{content.sectionSharingTitle}</h2>
          <p>{content.sectionSharingParagraph}</p>
        </section>

        <section className="mt-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-forest-green">{content.sectionRetentionTitle}</h2>
          <ul className="list-disc space-y-2 pl-5">
            {content.sectionRetentionItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-forest-green">{content.sectionRightsTitle}</h2>
          <p>{content.sectionRightsParagraph}</p>
          <p>
            {content.sectionRightsDeletionPrefix}
            <Link className="font-semibold text-primary underline-offset-4 hover:underline" href="/account-deletion">
              {content.sectionRightsDeletionLinkLabel}
            </Link>
            {content.sectionRightsDeletionSuffix}
          </p>
        </section>

        <p className="mt-12 border-t border-slate-200 pt-5 text-sm text-slate-600">
          {content.effectiveDateLabel} {content.effectiveDate}. {content.effectiveDateSuffix}
        </p>
      </div>
    </main>
  );
}
