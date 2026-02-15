import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { defaultLocale } from "@/i18n/request";

export default async function NotFound() {
  const locale = defaultLocale;
  const t = await getTranslations({ locale, namespace: "NotFound" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });

  const landingPath = `/${locale}`;
  const downloadAppUrl = process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL ?? "/";

  return (
    <div className="bg-background-light text-slate-900 antialiased">
      {/* ── Nav ── */}
      <header className="glass-header fixed left-0 right-0 top-0 z-50 border-b border-white/20">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
          <Link href={landingPath} className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-cream-beige shadow-sm">
              <Image src="/icon.png" alt="Nutra logo" width={32} height={32} />
            </div>
            <span className="text-xl font-bold tracking-tight text-forest-green">Nutra</span>
          </Link>

          <a
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90"
            href={downloadAppUrl}
          >
            {tNav("downloadNow")}
          </a>
        </div>
      </header>

      {/* ── Content ── */}
      <main id="main-content" tabIndex={-1} className="flex min-h-screen flex-col items-center justify-center bg-[#EBE1D1] px-4 pt-20">
        <div className="flex max-w-md flex-col items-center text-center">
          {/* 404 badge */}
          <span className="display-type text-[120px] font-extrabold leading-none text-forest-green/10 md:text-[160px]">
            404
          </span>

          {/* Icon */}
          <span
            className="material-symbols-outlined -mt-4 mb-6 text-forest-green/40"
            style={{ fontSize: 56, fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
          >
            skillet
          </span>

          {/* Copy */}
          <h1 className="display-type mb-3 text-2xl font-bold text-forest-green md:text-3xl">
            {t("title")}
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-forest-green/70 md:text-base">
            {t("subtitle")}
          </p>

          {/* CTA */}
          <Link
            href={landingPath}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18, fontVariationSettings: "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 20" }}
            >
              arrow_back
            </span>
            {t("backHome")}
          </Link>
        </div>
      </main>
    </div>
  );
}
