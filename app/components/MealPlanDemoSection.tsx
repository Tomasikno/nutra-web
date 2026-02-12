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
        emoji: "🥣",
        gradient: "from-orange-400 to-amber-500"
      },
      {
        slot: labels.lunch,
        recipe: labels.recipeLunch,
        calories: 680,
        portion: "350g",
        macros: { p: 52, c: 68, f: 22 },
        emoji: "🥗",
        gradient: "from-green-400 to-emerald-500"
      },
      {
        slot: labels.dinner,
        recipe: labels.recipeDinner,
        calories: 750,
        portion: "400g",
        macros: { p: 40, c: 65, f: 31 },
        emoji: "🐟",
        gradient: "from-blue-400 to-cyan-500"
      }
    ]
  };

  return (
    <section className="section-anchor px-6 pb-8 pt-2 lg:px-12">
      {/* Container with glass effect */}
      <div className="mx-auto grid max-w-7xl items-center gap-10 rounded-3xl border border-forest-green/15 bg-white/65 p-6 shadow-[0_24px_70px_-45px_rgba(28,51,37,0.8)] backdrop-blur-sm lg:grid-cols-[1fr_520px] lg:p-10">

        {/* Left Column: Marketing Copy */}
        <div className="space-y-6">
          {/* Badge */}
          <Reveal>
            <div className="inline-block">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary shadow-sm">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                {labels.badge}
              </p>
            </div>
          </Reveal>

          {/* Title */}
          <Reveal delay={100}>
            <h2 className="display-type mb-5 text-4xl font-bold text-forest-green lg:text-5xl leading-tight">
              {labels.title}
            </h2>
          </Reveal>

          {/* Subtitle */}
          <Reveal delay={200}>
            <p className="max-w-xl text-base leading-relaxed text-slate-600 lg:text-lg">
              {labels.subtitle}
            </p>
          </Reveal>

          {/* Feature highlights with icons */}
          <Reveal delay={300}>
            <ul className="space-y-3 pt-2">
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="leading-relaxed">{labels.featureAiPlans}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="leading-relaxed">{labels.featureMacroTracking}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="leading-relaxed">{labels.featureSwapRecipes}</span>
              </li>
            </ul>
          </Reveal>
        </div>

        {/* Right Column: Interactive Demo */}
        <Reveal direction="right" delay={400} className="mx-auto w-full max-w-[520px]">
          <div className="soft-card overflow-hidden rounded-2xl p-5 shadow-xl transition-all duration-500 hover:shadow-2xl">

            {/* Day Header */}
            <div className="mb-4 flex items-center justify-between border-b border-forest-green/10 pb-3">
              <h3 className="text-lg font-bold text-forest-green">
                {sampleDay.dayLabel}
              </h3>
              <span className="rounded-full bg-gradient-to-r from-primary/15 to-primary/10 px-3 py-1 text-sm font-bold text-primary shadow-sm ring-1 ring-primary/20">
                {sampleDay.totalCalories} {labels.totalCaloriesSuffix}
              </span>
            </div>

            {/* Macro Pills */}
            <div className="mb-5 grid grid-cols-3 gap-2">
              {/* Protein */}
              <div className="group rounded-xl border border-forest-green/20 bg-gradient-to-br from-forest-green/10 to-forest-green/5 px-3 py-2.5 text-center backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-forest-green/30 hover:shadow-md">
                <p className="text-[10px] font-bold uppercase tracking-wider text-forest-green/70 transition-colors group-hover:text-forest-green">
                  {labels.protein}
                </p>
                <p className="text-sm font-bold text-forest-green">
                  {sampleDay.macros.protein}g
                </p>
              </div>

              {/* Carbs */}
              <div className="group rounded-xl border border-warm-orange/20 bg-gradient-to-br from-warm-orange/10 to-warm-orange/5 px-3 py-2.5 text-center backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-warm-orange/30 hover:shadow-md">
                <p className="text-[10px] font-bold uppercase tracking-wider text-warm-orange/70 transition-colors group-hover:text-warm-orange">
                  {labels.carbs}
                </p>
                <p className="text-sm font-bold text-warm-orange">
                  {sampleDay.macros.carbs}g
                </p>
              </div>

              {/* Fat */}
              <div className="group rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-500/5 px-3 py-2.5 text-center backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-amber-500/30 hover:shadow-md">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700/70 transition-colors group-hover:text-amber-700">
                  {labels.fat}
                </p>
                <p className="text-sm font-bold text-amber-700">
                  {sampleDay.macros.fat}g
                </p>
              </div>
            </div>

            {/* Meal Slots */}
            <div className="space-y-3">
              {sampleDay.meals.map((meal, index) => (
                <Reveal key={index} direction="left" delay={500 + index * 100} distance={16}>
                  <div className="group flex items-center gap-3 rounded-xl border border-forest-green/10 bg-white p-3 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-forest-green/20 hover:shadow-md">
                    {/* Thumbnail with gradient and emoji */}
                    <div
                      className={`relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br ${meal.gradient} text-2xl shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}
                    >
                      <span className="relative z-10">{meal.emoji}</span>
                      {/* Subtle shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-forest-green/60 transition-colors group-hover:text-forest-green/80">
                        {meal.slot}
                      </p>
                      <p className="truncate text-sm font-semibold text-forest-green transition-colors group-hover:text-primary">
                        {meal.recipe}
                      </p>
                      <p className="text-xs text-slate-500 transition-colors group-hover:text-slate-600">
                        {meal.calories} kcal • {meal.portion}
                      </p>
                    </div>

                    {/* Macro badge (subtle, appears on hover) */}
                    <div className="shrink-0 opacity-0 transition-all duration-300 group-hover:opacity-100">
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
