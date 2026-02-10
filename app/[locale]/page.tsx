import PublicTopNav from "@/app/components/PublicTopNav";
import { defaultLocale, locales, type Locale } from "@/i18n/request";
import type { Recipe } from "@/lib/recipe-types";
import { supabaseAdmin } from "@/lib/supabase";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type RecipePreview = Pick<
  Recipe,
  | "id"
  | "slug"
  | "recipe_name"
  | "description"
  | "photo_url"
  | "prep_time_minutes"
  | "cook_time_minutes"
  | "servings"
  | "difficulty"
  | "ingredients"
  | "nutrition"
>;

function getDifficultyKey(difficulty: Recipe["difficulty"]): "easy" | "medium" | "hard" {
  if (difficulty === "EASY") return "easy";
  if (difficulty === "HARD") return "hard";
  return "medium";
}

function getIngredientsCount(ingredients: Recipe["ingredients"]): number {
  return Array.isArray(ingredients) ? ingredients.length : 0;
}

function getCaloriesPerServing(nutrition: Recipe["nutrition"]): number | null {
  if (!nutrition || typeof nutrition !== "object" || Array.isArray(nutrition)) return null;
  const perServing = (nutrition as { perServing?: { calories?: unknown } }).perServing;
  const calories = perServing?.calories;
  return typeof calories === "number" ? Math.round(calories) : null;
}

async function getRandomSharedRecipePreview(): Promise<RecipePreview | null> {
  if (!supabaseAdmin) return null;

  const { count, error: countError } = await supabaseAdmin
    .from("recipes")
    .select("id", { count: "exact", head: true })
    .is("deleted_at", null)
    .in("share_visibility", ["PUBLIC", "UNLISTED"]);

  if (countError || !count || count <= 0) return null;

  const randomOffset = Math.floor(Math.random() * count);

  const { data, error } = await supabaseAdmin
    .from("recipes")
    .select(
      "id, slug, recipe_name, description, photo_url, prep_time_minutes, cook_time_minutes, servings, difficulty, ingredients, nutrition"
    )
    .is("deleted_at", null)
    .in("share_visibility", ["PUBLIC", "UNLISTED"])
    .order("created_at", { ascending: false })
    .range(randomOffset, randomOffset);

  if (error || !data?.length) return null;
  return data[0] as RecipePreview;
}

const getCachedRandomSharedRecipePreview = unstable_cache(
  async () => getRandomSharedRecipePreview(),
  ["landing-random-shared-recipe-preview"],
  { revalidate: 180 }
);

type HomePageParams = {
  locale: string;
};

type HomePageProps = {
  params: Promise<HomePageParams>;
};

const localeMetadata: Record<Locale, { title: string; description: string }> = {
  cs: {
    title: "Nutra | Planovani jidel a vyzivovy kouc",
    description:
      "Planujte jidla, tvorte nakupni seznamy a ziskejte AI vyzivove tipy podle svych cilu.",
  },
  en: {
    title: "Nutra | Meal Planning and Nutrition Coach",
    description:
      "Plan meals, generate shopping lists, and get AI nutrition guidance tailored to your goals.",
  },
};

export function generateStaticParams(): HomePageParams[] {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locales, locale)) notFound();

  const resolvedLocale = locale as Locale;
  const seo = localeMetadata[resolvedLocale];

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: `/${resolvedLocale}`,
      languages: {
        cs: "/cs",
        en: "/en",
        "x-default": `/${defaultLocale}`,
      },
    },
    openGraph: {
      url: `/${resolvedLocale}`,
      title: seo.title,
      description: seo.description,
    },
    twitter: {
      title: seo.title,
      description: seo.description,
    },
  };
}

export default async function Home({ params }: HomePageProps) {
  const { locale } = await params;
  if (!hasLocale(locales, locale)) notFound();

  const resolvedLocale = locale as Locale;
  const tNav = await getTranslations({ locale, namespace: "Nav" });
  const tLanding = await getTranslations({ locale, namespace: "Landing" });
  const tRecipe = await getTranslations({ locale, namespace: "Recipe" });
  const randomRecipe = await getCachedRandomSharedRecipePreview();
  const fallbackRecipePath =
    "/r/d8bd7f2f-c158-4099-8df0-13b9a72db6ae-pagety-s-krtm-masem-a-rajaty";
  const previewRecipePath = randomRecipe ? `/r/${randomRecipe.slug}` : fallbackRecipePath;
  const previewIngredientsCount = randomRecipe ? getIngredientsCount(randomRecipe.ingredients) : null;
  const previewCalories = randomRecipe ? getCaloriesPerServing(randomRecipe.nutrition) : null;
  const previewDifficulty = randomRecipe
    ? tRecipe(`difficulty.${getDifficultyKey(randomRecipe.difficulty)}`)
    : null;

  const features = [
    {
      icon: "calendar_today",
      title: tLanding("features.items.weeklyMealPlan.title"),
      copy: tLanding("features.items.weeklyMealPlan.copy"),
    },
    {
      icon: "shopping_cart",
      title: tLanding("features.items.shoppingList.title"),
      copy: tLanding("features.items.shoppingList.copy"),
    },
    {
      icon: "cooking",
      title: tLanding("features.items.mealAnalysis.title"),
      copy: tLanding("features.items.mealAnalysis.copy"),
    },
    {
      icon: "magic_button",
      title: tLanding("features.items.aiSuggestions.title"),
      copy: tLanding("features.items.aiSuggestions.copy"),
    },
    {
      icon: "share",
      title: tLanding("features.items.createShareRecipes.title"),
      copy: tLanding("features.items.createShareRecipes.copy"),
    },
  ];

  const howItWorksSteps = [
    {
      number: "01",
      title: tLanding("features.items.weeklyMealPlan.title"),
      copy: tLanding("features.items.weeklyMealPlan.copy"),
    },
    {
      number: "02",
      title: tLanding("features.items.shoppingList.title"),
      copy: tLanding("features.items.shoppingList.copy"),
    },
    {
      number: "03",
      title: tLanding("features.items.mealAnalysis.title"),
      copy: tLanding("features.items.mealAnalysis.copy"),
    },
  ];

  const monthlyPlanPerks = [
    tLanding("pricing.plans.pro.perks.unlimitedAiFunctions"),
    tLanding("pricing.plans.pro.perks.aiMealAnalysis"),
    tLanding("pricing.plans.pro.perks.automatedShoppingLists"),
    tLanding("pricing.plans.pro.perks.detailedMacroInsights"),
    tLanding("pricing.plans.pro.perks.customDietPreferences"),
  ];

  const annualPlanPerks = [
    tLanding("pricing.plans.pro.perks.unlimitedAiFunctions"),
    tLanding("pricing.plans.pro.perks.aiMealAnalysis"),
    tLanding("pricing.plans.pro.perks.automatedShoppingLists"),
    tLanding("pricing.plans.pro.perks.detailedMacroInsights"),
    tLanding("pricing.plans.pro.perks.customDietPreferences"),
  ];

  const footerSections = [
    {
      title: tLanding("footer.sections.product.title"),
      links: [
        tLanding("footer.sections.product.links.features"),
      ],
    },
    {
      title: tLanding("footer.sections.company.title"),
      links: [
        tLanding("footer.sections.company.links.aboutUs"),
        tLanding("footer.sections.company.links.privacyPolicy"),
        tLanding("footer.sections.company.links.termsOfService"),
        tLanding("footer.sections.company.links.cookiePolicy"),
      ],
    },
  ];

  return (
    <div className="landing-canvas text-slate-900 antialiased">
      <PublicTopNav
        homeHref={`/${resolvedLocale}`}
        currentLocale={resolvedLocale}
        downloadAppUrl="#"
        labels={{
          features: tNav("features"),
          howItWorks: tNav("howItWorks"),
          pricing: tNav("pricing"),
          downloadNow: tNav("downloadNow"),
        }}
        links={{
          features: "#features",
          howItWorks: "#how-it-works",
          pricing: "#pricing",
        }}
      />

      <main>
        <section className="relative overflow-hidden pb-20 pt-40 lg:pb-24 lg:pt-44">
          <div className="absolute left-0 top-1/2 h-64 w-64 -ml-32 -translate-y-1/2 rounded-full bg-forest-green/10 blur-3xl" />
          <div className="absolute right-0 top-1/4 h-96 w-96 -mr-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative z-10 mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2 lg:items-center lg:px-12">
            <div>
              <p className="mb-6 inline-flex rounded-full border border-forest-green/20 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-forest-green/80">
                {tLanding("hero.badge")}
              </p>
              <h1 className="display-type mb-8 text-5xl font-extrabold leading-[1.02] text-forest-green lg:text-7xl">
                {tLanding("hero.titleLine1")}<br />
                {tLanding("hero.titleLine2")}
              </h1>
              <p className="mb-10 max-w-xl text-lg leading-relaxed text-forest-green/75 lg:text-xl">
                {tLanding("hero.subtitle")}
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <button className="w-full rounded-2xl bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-primary/90 sm:w-auto">
                  {tLanding("hero.ctaPrimary")}
                </button>
                <button className="w-full rounded-2xl border border-forest-green/30 bg-white/60 px-8 py-4 text-lg font-semibold text-forest-green transition-all hover:bg-white sm:w-auto">
                  {tLanding("hero.ctaSecondary")}
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="soft-card rounded-3xl p-6 sm:p-8">
                <p className="mb-4 text-sm font-semibold text-forest-green/70">{tLanding("hero.previewWeekLabel")}</p>
                <div className="space-y-3">
                  {features.slice(0, 3).map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between rounded-2xl border border-forest-green/10 bg-white px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg text-forest-green">
                          {item.icon}
                        </span>
                        <span className="text-sm font-semibold text-forest-green">{item.title}</span>
                      </div>
                      <span className="text-xs text-slate-500">{tLanding("hero.previewReadyLabel")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-anchor px-6 pb-8 pt-2 lg:px-12">
          <div className="mx-auto grid max-w-7xl items-center gap-10 rounded-3xl border border-forest-green/15 bg-white/65 p-6 shadow-[0_24px_70px_-45px_rgba(28,51,37,0.8)] backdrop-blur-sm lg:grid-cols-[1fr_520px] lg:p-10">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                {tLanding("recipePreview.badge")}
              </p>
              <h2 className="display-type mb-5 text-4xl font-bold text-forest-green lg:text-5xl">
                {tLanding("recipePreview.title")}
              </h2>
              <p className="mb-7 max-w-xl text-base leading-relaxed text-slate-600 lg:text-lg">
                {tLanding("recipePreview.subtitle")}
              </p>
              <Link
                href={previewRecipePath}
                className="inline-flex items-center gap-2 rounded-xl bg-forest-green px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-green/90"
              >
                {tLanding("recipePreview.cta")}
                <span className="material-symbols-outlined text-base">open_in_new</span>
              </Link>
            </div>

            <div className="mx-auto w-full max-w-[620px]">
              <div className="overflow-hidden rounded-[26px] border border-forest-green/20 bg-white shadow-[0_30px_70px_-45px_rgba(22,47,33,0.95)]">
                <div className="flex items-center justify-between border-b border-forest-green/10 bg-cream-beige/55 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#ff6d5e]" />
                    <span className="size-2 rounded-full bg-[#ffbe2e]" />
                    <span className="size-2 rounded-full bg-[#2eca43]" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-green/70">
                    {tLanding("recipePreview.previewLabel")}
                  </p>
                  <span className="rounded-full bg-forest-green/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-forest-green">
                    {tLanding("recipePreview.liveBadge")}
                  </span>
                </div>

                <Link href={previewRecipePath} className="group block">
                  <div className="relative h-56 overflow-hidden bg-[#d9d0bf]">
                    {randomRecipe?.photo_url ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url(${randomRecipe.photo_url})` }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-forest-green to-[#2f4e37]" />
                    )}
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/45 bg-white/70 p-4 backdrop-blur-sm">
                      <h3 className="text-lg font-bold leading-tight text-[#1c4c32] sm:text-xl">
                        {randomRecipe?.recipe_name ?? tLanding("recipePreview.fallbackTitle")}
                      </h3>
                      <p className="mt-1 text-sm text-[#355f46]">
                        {randomRecipe?.description ?? tLanding("recipePreview.fallbackSubtitle")}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 border-t border-forest-green/10 bg-white p-4 sm:grid-cols-4">
                    <div className="rounded-xl border border-forest-green/10 bg-cream-beige/25 px-3 py-2 text-center">
                      <p className="text-[11px] uppercase tracking-[0.09em] text-forest-green/70">
                        {tRecipe("prep")}
                      </p>
                      <p className="text-sm font-bold text-forest-green">
                        {randomRecipe?.prep_time_minutes ?? 0} min
                      </p>
                    </div>
                    <div className="rounded-xl border border-forest-green/10 bg-cream-beige/25 px-3 py-2 text-center">
                      <p className="text-[11px] uppercase tracking-[0.09em] text-forest-green/70">
                        {tRecipe("cook")}
                      </p>
                      <p className="text-sm font-bold text-forest-green">
                        {randomRecipe?.cook_time_minutes ?? 0} min
                      </p>
                    </div>
                    <div className="rounded-xl border border-forest-green/10 bg-cream-beige/25 px-3 py-2 text-center">
                      <p className="text-[11px] uppercase tracking-[0.09em] text-forest-green/70">
                        {tRecipe("servings")}
                      </p>
                      <p className="text-sm font-bold text-forest-green">
                        {randomRecipe?.servings ?? 1}
                      </p>
                    </div>
                    <div className="rounded-xl border border-forest-green/10 bg-cream-beige/25 px-3 py-2 text-center">
                      <p className="text-[11px] uppercase tracking-[0.09em] text-forest-green/70">
                        {tLanding("recipePreview.difficultyLabel")}
                      </p>
                      <p className="text-sm font-bold capitalize text-forest-green">
                        {previewDifficulty ?? "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-4">
                    <div className="flex flex-wrap gap-2">
                      {previewIngredientsCount != null && (
                        <span className="rounded-full bg-forest-green/10 px-3 py-1 text-xs font-semibold text-forest-green">
                          {previewIngredientsCount} {tRecipe("ingredients")}
                        </span>
                      )}
                      {previewCalories != null && (
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          {previewCalories} {tRecipe("nutrition.kcal")}
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-forest-green">
                      {tLanding("recipePreview.cta")}
                      <span className="material-symbols-outlined text-base">arrow_outward</span>
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section-anchor bg-background-light/80 py-20" id="features">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="mb-14 text-center">
              <h2 className="display-type mb-4 text-4xl font-bold text-forest-green lg:text-5xl">
                {tLanding("features.title")}
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-600">{tLanding("features.subtitle")}</p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
              {features.map((item, index) => {
                const featurePositionClass =
                  index === 3 ? "lg:col-start-2" : index === 4 ? "lg:col-start-4" : "";

                return (
                  <div
                    key={item.title}
                    className={`soft-card group rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg lg:col-span-2 ${featurePositionClass}`}
                  >
                    <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-forest-green/10 text-forest-green transition-colors group-hover:bg-forest-green group-hover:text-white">
                      <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-forest-green">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-600">{item.copy}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section-anchor py-20" id="how-it-works">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-primary/90">
                  {tNav("howItWorks")}
                </p>
                <h2 className="display-type text-4xl font-bold text-forest-green lg:text-5xl">
                  {tLanding("howItWorks.title")}
                </h2>
              </div>
              <p className="max-w-md text-slate-600">
                {tLanding("howItWorks.subtitle")}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {howItWorksSteps.map((step) => (
                <article key={step.number} className="soft-card rounded-2xl p-7">
                  <p className="display-type mb-4 text-4xl font-bold text-primary">{step.number}</p>
                  <h3 className="mb-3 text-xl font-bold text-forest-green">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{step.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-anchor bg-cream-beige/40 py-24" id="pricing">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="mb-16 text-center">
              <h2 className="display-type mb-4 text-4xl font-bold text-forest-green lg:text-5xl">
                {tLanding("pricing.title")}
              </h2>
              <p className="text-lg text-slate-600">{tLanding("pricing.subtitle")}</p>
            </div>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
              <div className="soft-card flex flex-col rounded-2xl p-8">
                <h3 className="mb-2 text-lg font-bold text-forest-green">{tLanding("pricing.plans.pro.name")}</h3>
                <div className="mb-6 text-3xl font-extrabold text-forest-green">
                  $9.99
                  <span className="text-base font-normal text-slate-500">
                    {tLanding("pricing.plans.pro.priceSuffix")}
                  </span>
                </div>
                <ul className="mb-8 flex-grow space-y-4">
                  {monthlyPlanPerks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="material-symbols-outlined text-sm text-forest-green">
                        check_circle
                      </span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <button className="w-full rounded-xl border border-forest-green/35 py-3 font-semibold text-forest-green transition-colors hover:bg-forest-green/5">
                  {tLanding("pricing.plans.pro.cta")}
                </button>
              </div>

              <div className="relative z-10 flex scale-105 flex-col rounded-2xl border-2 border-primary bg-white p-8 shadow-xl shadow-primary/20">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white">
                  {tLanding("pricing.mostPopular")}
                </div>
                <h3 className="mb-2 text-lg font-bold text-forest-green">{tLanding("pricing.plans.life.name")}</h3>
                <div className="mb-6 text-3xl font-extrabold text-forest-green">
                  $79.99
                  <span className="text-base font-normal text-slate-500">
                    {tLanding("pricing.plans.life.priceSuffix")}
                  </span>
                </div>
                <ul className="mb-8 flex-grow space-y-4">
                  {annualPlanPerks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <button className="w-full rounded-xl bg-primary py-3 font-semibold text-white transition-colors hover:bg-primary/90">
                  {tLanding("pricing.plans.life.cta")}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background-light px-6 py-20 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-forest-green to-emerald-800 px-8 py-16 text-center text-white lg:py-24">
              <div className="relative z-10 mx-auto max-w-3xl">
                <h2 className="display-type mb-6 text-4xl font-black lg:text-6xl">{tLanding("finalCta.title")}</h2>
                <p className="mb-10 text-lg leading-relaxed opacity-90">{tLanding("finalCta.subtitle")}</p>
                <button className="rounded-xl bg-white px-10 py-4 text-lg font-semibold text-forest-green shadow-lg transition-all hover:scale-105 hover:bg-slate-100 active:scale-95">
                  {tLanding("finalCta.button")}
                </button>
              </div>
              <div className="absolute right-0 top-0 size-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 size-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-background-light pb-10 pt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-6 flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-lg bg-cream-beige shadow-sm">
                  <Image src="/logo.png" alt={tLanding("logoAlt")} width={32} height={32} />
                </div>
                <h2 className="display-type text-2xl font-bold text-forest-green">Nutra</h2>
              </div>
              <p className="text-sm leading-relaxed text-slate-500">{tLanding("footer.description")}</p>
            </div>
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="mb-6 font-bold text-forest-green">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a className="text-sm text-slate-500 transition-colors hover:text-primary" href="#">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 md:flex-row">
            <p className="text-xs text-slate-400">{tLanding("footer.copyright")}</p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-slate-400">{tLanding("footer.builtWith")}</span>
              <span className="material-symbols-outlined text-lg text-slate-400">language</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
