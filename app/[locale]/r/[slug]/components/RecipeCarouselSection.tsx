"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type CarouselRecipe = {
  id: string;
  recipeName: string;
  description: string | null;
  photoUrl: string | null;
  href: string;
};

type RecipeCarouselSectionProps = {
  title: string;
  ctaLabel: string;
  recipes: CarouselRecipe[];
};

export default function RecipeCarouselSection({ title, ctaLabel, recipes }: RecipeCarouselSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(recipes.length > 1);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const updateButtons = () => {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    updateButtons();
    el.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);

    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [recipes.length]);

  const scrollByAmount = (direction: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;

    const amount = Math.round(el.clientWidth * 0.92);
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="display-type text-2xl font-semibold text-forest-green md:text-3xl">{title}</h2>
        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            disabled={!canScrollLeft}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-forest-green/25 bg-white/80 text-forest-green transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Scroll left"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            disabled={!canScrollRight}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-forest-green/25 bg-white/80 text-forest-green transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Scroll right"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {recipes.map((recipe) => (
          <article
            key={recipe.id}
            className="soft-card flex min-h-[360px] min-w-[82%] snap-start flex-col overflow-hidden rounded-[24px] md:min-w-[360px]"
          >
            <div className="relative h-48 w-full">
              {recipe.photoUrl ? (
                <Image
                  src={recipe.photoUrl}
                  alt={recipe.recipeName}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 82vw, 360px"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-forest-green/85 to-forest-green/40" />
              )}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="line-clamp-2 text-xl font-semibold text-forest-green">{recipe.recipeName}</h3>
              {recipe.description ? (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-forest-green/75">{recipe.description}</p>
              ) : (
                <p className="mt-2 text-sm text-forest-green/60">&nbsp;</p>
              )}
              <div className="mt-auto pt-5">
                <Link
                  href={recipe.href}
                  className="inline-flex items-center rounded-full bg-forest-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-forest-green/90"
                >
                  {ctaLabel}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
