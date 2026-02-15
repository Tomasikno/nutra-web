import Image from "next/image";
import Link from "next/link";

type PublicTopNavLabels = {
  features: string;
  howItWorks: string;
  pricing: string;
  downloadNow: string;
};

type PublicTopNavProps = {
  homeHref?: string;
  currentLocale?: "cs" | "en";
  downloadAppUrl: string;
  labels: PublicTopNavLabels;
  links?: {
    features?: string;
    howItWorks?: string;
    pricing?: string;
  };
};

export default function PublicTopNav({
  homeHref = "/",
  currentLocale = "cs",
  downloadAppUrl,
  labels,
  links,
}: PublicTopNavProps) {
  const featuresHref = links?.features ?? `${homeHref}#features`;
  const howItWorksHref = links?.howItWorks ?? `${homeHref}#how-it-works`;
  const pricingHref = links?.pricing ?? `${homeHref}#pricing`;

  return (
    <header className="glass-header fixed left-0 right-0 top-0 z-50 border-b border-white/20">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        <Link href={homeHref} className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-cream-beige shadow-sm">
            <Image src="/icon.png" alt="" width={32} height={32} />
          </div>
          <span className="text-xl font-bold tracking-tight text-forest-green">Nutra</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-10 md:flex">
          <a
            className="text-sm font-semibold text-forest-green/80 transition-colors hover:text-forest-green"
            href={featuresHref}
          >
            {labels.features}
          </a>
          <a
            className="text-sm font-semibold text-forest-green/80 transition-colors hover:text-forest-green"
            href={howItWorksHref}
          >
            {labels.howItWorks}
          </a>
          <a
            className="text-sm font-semibold text-forest-green/80 transition-colors hover:text-forest-green"
            href={pricingHref}
          >
            {labels.pricing}
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 rounded-lg border border-forest-green/20 bg-white/70 p-1">
            <Link
              href="/cs"
              aria-current={currentLocale === "cs" ? "page" : undefined}
              aria-label="Switch language to Czech"
              className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
                currentLocale === "cs"
                  ? "bg-forest-green text-white"
                  : "text-forest-green/80 hover:text-forest-green"
              }`}
            >
              CS
            </Link>
            <Link
              href="/en"
              aria-current={currentLocale === "en" ? "page" : undefined}
              aria-label="Switch language to English"
              className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
                currentLocale === "en"
                  ? "bg-forest-green text-white"
                  : "text-forest-green/80 hover:text-forest-green"
              }`}
            >
              EN
            </Link>
          </div>
          <a
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90"
            href={downloadAppUrl}
          >
            {labels.downloadNow}
          </a>
        </div>
      </div>
    </header>
  );
}
