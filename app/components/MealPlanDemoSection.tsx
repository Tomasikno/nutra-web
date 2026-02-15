"use client";

import Reveal from "@/app/components/Reveal";

interface MealPlanDemoSectionProps {
  labels: {
    badge: string;
    title: string;
    subtitle: string;
    dayLabel: string;
    totalCaloriesSuffix: string;
    protein: string;
    carbs: string;
    fat: string;
    breakfast: string;
    lunch: string;
    dinner: string;
    featureAiPlans: string;
    featureMacroTracking: string;
    featureSwapRecipes: string;
    recipeBreakfast: string;
    recipeLunch: string;
    recipeDinner: string;
    hoverHint: string;
  };
}

export default function MealPlanDemoSection({ labels }: MealPlanDemoSectionProps) {
  const sampleDay = {
    dayLabel: labels.dayLabel,
    totalCalories: 1850,
    macros: { protein: 120, carbs: 185, fat: 65 },
    meals: [
      {
        slot: labels.breakfast,
        recipe: labels.recipeBreakfast,
        calories: 420,
        portion: "250g",
        macros: { p: 28, c: 52, f: 12 },
        icon: "breakfast_dining",
        gradient: "from-orange-400 to-amber-500",
      },
      {
        slot: labels.lunch,
        recipe: labels.recipeLunch,
        calories: 680,
        portion: "350g",
        macros: { p: 52, c: 68, f: 22 },
        icon: "lunch_dining",
        gradient: "from-green-400 to-emerald-500",
      },
      {
        slot: labels.dinner,
        recipe: labels.recipeDinner,
        calories: 750,
        portion: "400g",
        macros: { p: 40, c: 65, f: 31 },
        icon: "dinner_dining",
        gradient: "from-blue-400 to-cyan-500",
      },
    ],
  };

  return (
    <section className="section-anchor px-2 pb-8 pt-2 sm:px-6 lg:px-12">
      <div className="mx-auto grid max-w-7xl items-center gap-7 sm:gap-10 sm:rounded-3xl sm:border sm:border-forest-green/15 sm:bg-white/65 sm:p-6 sm:shadow-[0_24px_70px_-45px_rgba(28,51,37,0.8)] sm:backdrop-blur-sm lg:grid-cols-[1fr_520px] lg:p-10">
        <div className="space-y-5 rounded-2xl border border-forest-green/15 bg-white/65 p-5 shadow-lg backdrop-blur-sm sm:space-y-6 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
          <Reveal>
            <div className="inline-block">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary shadow-sm sm:text-xs">
                <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                {labels.badge}
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="display-type mb-4 text-[2.05rem] font-bold leading-[1.08] text-balance text-forest-green sm:mb-5 sm:text-4xl lg:text-5xl">
              {labels.title}
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p className="max-w-[34ch] text-sm leading-relaxed text-slate-600 sm:max-w-xl sm:text-base lg:text-lg">
              {labels.subtitle}
            </p>
          </Reveal>

          <Reveal delay={300}>
            <ul className="space-y-2.5 pt-1.5 sm:space-y-3 sm:pt-2">
              <li className="flex items-start gap-3 text-[15px] text-slate-700 sm:text-sm">
                <svg aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="leading-relaxed">{labels.featureAiPlans}</span>
              </li>
              <li className="flex items-start gap-3 text-[15px] text-slate-700 sm:text-sm">
                <svg aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="leading-relaxed">{labels.featureMacroTracking}</span>
              </li>
              <li className="flex items-start gap-3 text-[15px] text-slate-700 sm:text-sm">
                <svg aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="leading-relaxed">{labels.featureSwapRecipes}</span>
              </li>
            </ul>
          </Reveal>
        </div>

        <Reveal direction="right" delay={400} className="mx-auto w-full sm:max-w-[520px]">
          <div className="soft-card overflow-hidden rounded-2xl p-3.5 shadow-xl transition-all duration-500 hover:shadow-2xl sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-forest-green/10 pb-3">
              <h3 className="text-base font-bold text-forest-green sm:text-lg">{sampleDay.dayLabel}</h3>
              <span className="rounded-full bg-gradient-to-r from-primary/15 to-primary/10 px-2.5 py-1 text-xs font-bold text-primary shadow-sm ring-1 ring-primary/20 sm:px-3 sm:text-sm">
                {sampleDay.totalCalories} {labels.totalCaloriesSuffix}
              </span>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-1.5 sm:mb-5 sm:gap-2">
              <div className="group rounded-xl border border-forest-green/20 bg-gradient-to-br from-forest-green/10 to-forest-green/5 px-2 py-2 text-center backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-forest-green/30 hover:shadow-md sm:px-3 sm:py-2.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-forest-green/70 transition-colors group-hover:text-forest-green sm:text-[10px] sm:tracking-wider">
                  {labels.protein}
                </p>
                <p className="text-[15px] font-bold text-forest-green sm:text-sm">{sampleDay.macros.protein}g</p>
              </div>

              <div className="group rounded-xl border border-warm-orange/20 bg-gradient-to-br from-warm-orange/10 to-warm-orange/5 px-2 py-2 text-center backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-warm-orange/30 hover:shadow-md sm:px-3 sm:py-2.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-warm-orange/70 transition-colors group-hover:text-warm-orange sm:text-[10px] sm:tracking-wider">
                  {labels.carbs}
                </p>
                <p className="text-[15px] font-bold text-warm-orange sm:text-sm">{sampleDay.macros.carbs}g</p>
              </div>

              <div className="group rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-500/5 px-2 py-2 text-center backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-amber-500/30 hover:shadow-md sm:px-3 sm:py-2.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-amber-700/70 transition-colors group-hover:text-amber-700 sm:text-[10px] sm:tracking-wider">
                  {labels.fat}
                </p>
                <p className="text-[15px] font-bold text-amber-700 sm:text-sm">{sampleDay.macros.fat}g</p>
              </div>
            </div>

            <div className="space-y-3">
              {sampleDay.meals.map((meal, index) => (
                <Reveal key={meal.slot} direction="left" delay={500 + index * 100} distance={16}>
                  <div className="group flex items-center gap-2.5 rounded-xl border border-forest-green/10 bg-white p-2.5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-forest-green/20 hover:shadow-md sm:gap-3 sm:p-3">
                    <div
                      className={`relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br ${meal.gradient} text-xl shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md sm:size-12 sm:text-2xl`}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined relative z-10 !text-xl sm:!text-2xl">
                        {meal.icon}
                      </span>
                      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-forest-green/70 transition-colors group-hover:text-forest-green/90 sm:text-xs sm:tracking-wider">
                        {meal.slot}
                      </p>
                      <p className="truncate text-[13px] font-semibold text-forest-green transition-colors group-hover:text-primary sm:text-sm">
                        {meal.recipe}
                      </p>
                      <p className="text-[11px] text-slate-600 transition-colors group-hover:text-slate-700 sm:text-xs">
                        {meal.calories} kcal - {meal.portion}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <div className="rounded-md bg-forest-green/5 px-2 py-1 text-[10px] font-medium text-forest-green">
                        <span className="text-forest-green/70">P:</span> {meal.macros.p}g
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

