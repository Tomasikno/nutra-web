import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { locales, type Locale } from "@/i18n/request";
import { buildRecipePath, buildRecipeRouteSlug, extractRecipeIdFromRouteSlug } from "@/lib/recipe-route";
import {
  buildCanonicalUrl,
  getDefaultOgImage,
  getDefaultTwitterImage,
  resolveOgAlternateLocales,
  resolveOgLocale,
} from "@/lib/seo";
import { supabasePublic } from "@/lib/supabase";
import type { Ingredient, Recipe } from "@/lib/recipe-types";
import PublicTopNav from "@/app/components/PublicTopNav";
import RecipeHeroSection from "./components/RecipeHeroSection";
import RecipeIngredientsSection from "./components/RecipeIngredientsSection";
import RecipeNutritionSection from "./components/RecipeNutritionSection";
import RecipeStepsSection from "./components/RecipeStepsSection";

type PageParams = { locale: string; slug: string };

function resolveRecipeLocale(recipeLanguage: Recipe["language"]): Locale {
  return recipeLanguage === "en" ? "en" : "cs";
}

function getDifficultyKey(difficulty: string): "easy" | "medium" | "hard" {
  const normalized = difficulty.toLowerCase();
  if (normalized === "easy") return "easy";
  if (normalized === "hard") return "hard";
  return "medium";
}

function toIsoDuration(minutes: number | null): string | undefined {
  if (!minutes || minutes <= 0) return undefined;
  return `PT${minutes}M`;
}

async function getRecipe(id: string): Promise<Recipe | null> {
  if (!supabasePublic) return null;

  const { data, error } = await supabasePublic
    .from("recipes")
    .select(
      "id, recipe_name, description, servings, prep_time_minutes, cook_time_minutes, difficulty, " +
        "portion_size, ingredients, steps, nutrition, health_benefits, warnings, health_score, " +
        "dietary_tags, meal_categories, time_of_day, share_visibility, slug, language, " +
        "photo_url, created_at, updated_at, deleted_at"
    )
    .eq("id", id)
    .is("deleted_at", null)
    .in("share_visibility", ["PUBLIC", "UNLISTED"])
    .single();

  if (error || !data) return null;
  return data as unknown as Recipe;
}

async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  if (!supabasePublic) return null;

  const { data, error } = await supabasePublic
    .from("recipes")
    .select(
      "id, recipe_name, description, servings, prep_time_minutes, cook_time_minutes, difficulty, " +
        "portion_size, ingredients, steps, nutrition, health_benefits, warnings, health_score, " +
        "dietary_tags, meal_categories, time_of_day, share_visibility, slug, language, " +
        "photo_url, created_at, updated_at, deleted_at"
    )
    .eq("slug", slug)
    .is("deleted_at", null)
    .in("share_visibility", ["PUBLIC", "UNLISTED"])
    .single();

  if (error || !data) return null;
  return data as unknown as Recipe;
}

async function getRecipeBySlugSuffix(slugSuffix: string): Promise<Recipe | null> {
  if (!supabasePublic) return null;

  const { data, error } = await supabasePublic
    .from("recipes")
    .select(
      "id, recipe_name, description, servings, prep_time_minutes, cook_time_minutes, difficulty, " +
        "portion_size, ingredients, steps, nutrition, health_benefits, warnings, health_score, " +
        "dietary_tags, meal_categories, time_of_day, share_visibility, slug, language, " +
        "photo_url, created_at, updated_at, deleted_at"
    )
    .ilike("slug", `%-${slugSuffix}`)
    .is("deleted_at", null)
    .in("share_visibility", ["PUBLIC", "UNLISTED"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as Recipe;
}

async function getRecipeFromRouteSlug(routeSlug: string): Promise<Recipe | null> {
  const recipeId = extractRecipeIdFromRouteSlug(routeSlug);
  if (recipeId) {
    const byId = await getRecipe(recipeId);
    if (byId) return byId;
  }

  const byExactSlug = await getRecipeBySlug(routeSlug);
  if (byExactSlug) return byExactSlug;

  return getRecipeBySlugSuffix(routeSlug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(locales, locale)) return { title: "Not Found" };

  const recipe = await getRecipeFromRouteSlug(slug);
  if (!recipe) {
    const t = await getTranslations({ locale, namespace: "Recipe" });
    return { title: t("notFound") };
  }

  const recipeLocale = resolveRecipeLocale(recipe.language);
  if (recipeLocale !== locale) {
    return { title: recipe.recipe_name };
  }

  const isPublic = recipe.share_visibility === "PUBLIC";
  const canonicalPath = buildRecipePath(locale, recipe.id, recipe.slug);
  const description =
    recipe.description?.trim() ||
    "View ingredients, nutrition, and step-by-step instructions.";
  const ogImages = recipe.photo_url
    ? [{ url: recipe.photo_url, alt: recipe.recipe_name }, getDefaultOgImage()]
    : [getDefaultOgImage()];
  const twitterImages = recipe.photo_url
    ? [{ url: recipe.photo_url, alt: recipe.recipe_name }, getDefaultTwitterImage()]
    : [getDefaultTwitterImage()];

  return {
    title: recipe.recipe_name,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    robots: {
      index: isPublic,
      follow: isPublic,
    },
    openGraph: {
      title: recipe.recipe_name,
      description,
      type: "article",
      siteName: "Nutra",
      url: canonicalPath,
      locale: resolveOgLocale(locale),
      alternateLocale: resolveOgAlternateLocales(locale),
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: recipe.recipe_name,
      description,
      images: twitterImages,
    },
  };
}

type NutritionPerServing = {
  calories: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
};

type Nutrition = {
  perServing?: NutritionPerServing;
};

export default async function RecipePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale, slug } = await params;
  if (!hasLocale(locales, locale)) notFound();

  const recipe = await getRecipeFromRouteSlug(slug);
  if (!recipe) notFound();

  // Redirect to the correct locale if recipe language doesn't match URL locale
  const recipeLocale = resolveRecipeLocale(recipe.language);
  if (recipeLocale !== locale) {
    permanentRedirect(buildRecipePath(recipeLocale, recipe.id, recipe.slug));
  }

  const canonicalRouteSlug = buildRecipeRouteSlug(recipe.id, recipe.slug);
  const canonicalPath = buildRecipePath(locale, recipe.id, recipe.slug);
  if (slug !== canonicalRouteSlug) {
    redirect(canonicalPath);
  }

  const landingPath = `/${locale}`;
  const t = await getTranslations({ locale, namespace: "Recipe" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });

  const ingredients = (recipe.ingredients ?? []) as unknown as Ingredient[];
  const steps = (recipe.steps ?? []) as unknown as string[];
  const nutrition = recipe.nutrition as unknown as Nutrition | null;
  const perServing = nutrition?.perServing;
  const portionLabel = recipe.portion_size?.trim() || "300g";
  const downloadAppUrl = process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL ?? "/";

  const nutritionItems = [
    {
      label: t("nutrition.kcal"),
      value: perServing?.calories != null ? `${Math.round(perServing.calories)}` : "-",
    },
    {
      label: t("nutrition.protein"),
      value: perServing?.proteinG != null ? `${Math.round(perServing.proteinG)}g` : "-",
    },
    {
      label: t("nutrition.carbs"),
      value: perServing?.carbsG != null ? `${Math.round(perServing.carbsG)}g` : "-",
    },
    {
      label: t("nutrition.fat"),
      value: perServing?.fatG != null ? `${Math.round(perServing.fatG)}g` : "-",
    },
  ];

  const hasIngredients = ingredients.length > 0;
  const hasSteps = steps.length > 0;
  const nutritionSchema =
    perServing?.calories != null
      ? {
          "@type": "NutritionInformation",
          calories: `${Math.round(perServing.calories)} kcal`,
          ...(perServing.proteinG != null ? { proteinContent: `${Math.round(perServing.proteinG)} g` } : {}),
          ...(perServing.carbsG != null ? { carbohydrateContent: `${Math.round(perServing.carbsG)} g` } : {}),
          ...(perServing.fatG != null ? { fatContent: `${Math.round(perServing.fatG)} g` } : {}),
        }
      : undefined;
  const recipeSchema =
    recipe.share_visibility === "PUBLIC"
      ? {
          "@context": "https://schema.org",
          "@type": "Recipe",
          name: recipe.recipe_name,
          ...(recipe.description ? { description: recipe.description } : {}),
          ...(recipe.photo_url ? { image: [recipe.photo_url] } : {}),
          ...(recipe.created_at ? { datePublished: recipe.created_at } : {}),
          ...(recipe.updated_at ? { dateModified: recipe.updated_at } : {}),
          ...(recipe.servings ? { recipeYield: `${recipe.servings}` } : {}),
          ...(toIsoDuration(recipe.prep_time_minutes)
            ? { prepTime: toIsoDuration(recipe.prep_time_minutes) }
            : {}),
          ...(toIsoDuration(recipe.cook_time_minutes)
            ? { cookTime: toIsoDuration(recipe.cook_time_minutes) }
            : {}),
          ...(toIsoDuration((recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0))
            ? { totalTime: toIsoDuration((recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0)) }
            : {}),
          recipeIngredient: ingredients
            .map((ingredient) => {
              const name = ingredient.name?.trim();
              if (!name) return null;
              const amount = ingredient.amount?.trim();
              const unit = ingredient.unit?.trim();
              if (!amount && !unit) return name;
              return [amount, unit, name].filter(Boolean).join(" ");
            })
            .filter((value): value is string => Boolean(value)),
          recipeInstructions: steps
            .map((step) => step.trim())
            .filter(Boolean)
            .map((text, index) => ({
              "@type": "HowToStep",
              position: index + 1,
              text,
            })),
          ...(nutritionSchema ? { nutrition: nutritionSchema } : {}),
          inLanguage: locale,
          url: buildCanonicalUrl(canonicalPath),
          author: {
            "@type": "Organization",
            name: "Nutra",
          },
          publisher: {
            "@type": "Organization",
            name: "Nutra",
          },
        }
      : null;

  return (
    <div className="bg-background-light text-slate-900 antialiased">
      {recipeSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeSchema) }}
        />
      )}

      <PublicTopNav
        homeHref={landingPath}
        currentLocale={locale}
        downloadAppUrl={downloadAppUrl}
        labels={{
          features: tNav("features"),
          howItWorks: tNav("howItWorks"),
          pricing: tNav("pricing"),
          downloadNow: tNav("downloadNow"),
        }}
        links={{
          features: `${landingPath}#features`,
          howItWorks: `${landingPath}#how-it-works`,
          pricing: `${landingPath}#pricing`,
        }}
      />

      <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EBE1D1] px-4 pb-8 pt-28 text-[#0D4715] md:px-8 md:pt-32">
        <div className="mx-auto w-full max-w-[1180px] space-y-8">
          <RecipeHeroSection
            recipeName={recipe.recipe_name}
            description={recipe.description}
            photoUrl={recipe.photo_url}
            prepTimeMinutes={recipe.prep_time_minutes}
            cookTimeMinutes={recipe.cook_time_minutes}
            servings={recipe.servings}
            difficultyLabel={t(`difficulty.${getDifficultyKey(recipe.difficulty)}`)}
            downloadAppUrl={downloadAppUrl}
            labels={{
              prep: t("prep"),
              cook: t("cook"),
              servings: t("servings"),
              downloadApp: t("downloadApp"),
            }}
          />

          {perServing && (
            <RecipeNutritionSection
              portionLabel={portionLabel}
              perLabel={t("per")}
              items={nutritionItems}
            />
          )}

          {(hasIngredients || hasSteps) && (
            <section className="grid gap-8 md:grid-cols-[360px_1fr]">
              <RecipeIngredientsSection title={t("ingredients")} ingredients={ingredients} />
              <RecipeStepsSection title={t("cookingSteps")} steps={steps} />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
