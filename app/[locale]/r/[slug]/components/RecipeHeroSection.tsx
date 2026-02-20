import Image from "next/image";

type RecipeHeroSectionProps = {
  recipeName: string;
  description: string | null;
  photoUrl: string | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  servings: number;
  difficultyLabel: string;
  downloadAppUrl: string;
  labels: {
    prep: string;
    cook: string;
    servings: string;
    downloadApp: string;
  };
};

export default function RecipeHeroSection({
  recipeName,
  description,
  photoUrl,
  prepTimeMinutes,
  cookTimeMinutes,
  servings,
  difficultyLabel,
  downloadAppUrl,
  labels,
}: RecipeHeroSectionProps) {
  return (
    <section className="soft-card relative overflow-hidden rounded-[28px]">
      {photoUrl ? (
        <div className="relative h-[420px] w-full">
          <Image
            src={photoUrl}
            alt={recipeName}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 1180px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-[420px] w-full bg-gradient-to-br from-forest-green to-forest-green/70" />
      )}

      <div className="absolute inset-0 bg-black/20" />

      <div className="absolute bottom-6 left-6 right-6 max-w-3xl rounded-[40px] border border-white/45 bg-white/60 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] backdrop-blur-sm md:bottom-10 md:left-10 md:right-auto md:p-8">
        <h1 className="display-type text-3xl font-bold leading-tight text-forest-green md:text-4xl">
          {recipeName}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-base leading-snug text-forest-green/75 md:mt-4 md:text-lg md:leading-relaxed">
            {description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[1.1rem] text-forest-green md:mt-6 md:text-base">
          <span>
            {labels.prep}: {prepTimeMinutes || 0}min
          </span>
          <span>
            {labels.cook}: {cookTimeMinutes || 0}min
          </span>
          <span>
            {servings} {labels.servings}
          </span>
          <span className="capitalize">{difficultyLabel}</span>
        </div>
      </div>

      <a
        href={downloadAppUrl}
        className="absolute bottom-6 right-6 z-20 inline-flex items-center gap-2 rounded-full border border-primary/80 bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-green md:bottom-10 md:right-10 md:px-5 md:py-3"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-white text-primary">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d="M12 4v11" />
            <path d="m8 11 4 4 4-4" />
            <path d="M5 19h14" />
          </svg>
        </span>
        {labels.downloadApp}
      </a>
    </section>
  );
}
