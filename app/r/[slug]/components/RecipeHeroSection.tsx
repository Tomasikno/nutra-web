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
    <section className="relative overflow-hidden rounded-[28px] border border-[#2f4e37]/30 bg-[#d9d0bf]">
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
        <div className="h-[420px] w-full bg-gradient-to-br from-[#41644A] to-[#2f4e37]" />
      )}

      <div className="absolute inset-0 bg-black/20" />

      <div className="absolute bottom-6 left-6 right-6 max-w-3xl rounded-[40px] border border-white/45 bg-white/58 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] backdrop-blur-sm md:bottom-10 md:left-10 md:right-auto md:p-8">
        <h1 className="text-3xl font-semibold leading-tight text-[#1c4c32] md:text-4xl">
          {recipeName}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-base leading-snug text-[#355f46] md:mt-4 md:text-lg md:leading-relaxed">
            {description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[1.1rem] text-[#1f4d34] md:mt-6 md:text-base">
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
        className="absolute bottom-6 right-6 z-20 inline-flex items-center gap-2 rounded-full border border-[#b95b1d] bg-[#e57e2f] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(143,72,24,0.45)] transition hover:bg-[#da7429] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2f4e37] md:bottom-10 md:right-10 md:px-5 md:py-3"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-white text-[#e57e2f]">
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
