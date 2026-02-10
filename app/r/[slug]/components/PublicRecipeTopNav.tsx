import Image from "next/image";
import Link from "next/link";

type PublicRecipeTopNavLabels = {
  features: string;
  howItWorks: string;
  pricing: string;
  logIn: string;
  downloadNow: string;
};

type PublicRecipeTopNavProps = {
  downloadAppUrl: string;
  labels: PublicRecipeTopNavLabels;
};

export default function PublicRecipeTopNav({
  downloadAppUrl,
  labels,
}: PublicRecipeTopNavProps) {
  return (
    <header className="glass-header fixed left-0 right-0 top-0 z-50 border-b border-white/20">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-cream-beige shadow-sm">
            <Image src="/icon.png" alt="Nutra logo" width={32} height={32} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-forest-green">Nutra</h1>
        </div>

        <nav className="hidden items-center gap-10 md:flex">
          <a
            className="text-sm font-semibold text-forest-green/80 transition-colors hover:text-forest-green"
            href="#"
          >
            {labels.features}
          </a>
          <a
            className="text-sm font-semibold text-forest-green/80 transition-colors hover:text-forest-green"
            href="#"
          >
            {labels.howItWorks}
          </a>
          <a
            className="text-sm font-semibold text-forest-green/80 transition-colors hover:text-forest-green"
            href="#pricing"
          >
            {labels.pricing}
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            className="hidden px-4 py-2 text-sm font-semibold text-forest-green/80 transition-colors hover:text-forest-green sm:block"
            href="/admin"
          >
            {labels.logIn}
          </Link>
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
