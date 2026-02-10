import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/request";
import { supabaseAdmin } from "@/lib/supabase";
import type { Ingredient, Recipe } from "@/lib/recipe-types";
import PublicRecipeTopNav from "./components/PublicRecipeTopNav";
import RecipeHeroSection from "./components/RecipeHeroSection";
import RecipeIngredientsSection from "./components/RecipeIngredientsSection";
import RecipeNutritionSection from "./components/RecipeNutritionSection";
import RecipeStepsSection from "./components/RecipeStepsSection";

type PageParams = { slug: string };

/** Extract recipe UUID from the URL slug (format: {uuid}-{name-slug}) */
function extractRecipeId(slug: string): string | null {
  const uuidPattern = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const match = slug.match(uuidPattern);
  return match ? match[1] : null;
}

function resolveLocale(recipeLanguage: Recipe["language"]): Locale {
  return recipeLanguage === "en" ? "en" : "cs";
}

function getDifficultyKey(difficulty: string): "easy" | "medium" | "hard" {
  const normalized = difficulty.toLowerCase();
  if (normalized === "easy") return "easy";
  if (normalized === "hard") return "hard";
  return "medium";
}

async function getRecipe(id: string): Promise<Recipe | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
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

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recipeId = extractRecipeId(slug);

  if (!recipeId) {
    const t = await getTranslations({ locale: "cs", namespace: "Recipe" });
    return { title: t("notFound") };
  }

  const recipe = await getRecipe(recipeId);
  if (!recipe) {
    const t = await getTranslations({ locale: "cs", namespace: "Recipe" });
    return { title: t("notFound") };
  }

  const isPublic = recipe.share_visibility === "PUBLIC";

  return {
    title: `${recipe.recipe_name} - Nutra`,
    description: recipe.description,
    robots: isPublic ? "index,follow" : "noindex,nofollow",
    openGraph: {
      title: recipe.recipe_name,
      description: recipe.description,
      ...(recipe.photo_url ? { images: [recipe.photo_url] } : {}),
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
  const { slug } = await params;
  const recipeId = extractRecipeId(slug);
  if (!recipeId) notFound();

  const recipe = await getRecipe(recipeId);
  if (!recipe) notFound();

  const locale = resolveLocale(recipe.language);
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

  return (
    <div className="bg-background-light text-slate-900 antialiased">
      <PublicRecipeTopNav
        downloadAppUrl={downloadAppUrl}
        labels={{
          features: tNav("features"),
          howItWorks: tNav("howItWorks"),
          pricing: tNav("pricing"),
          logIn: tNav("logIn"),
          downloadNow: tNav("downloadNow"),
        }}
      />

      <main className="min-h-screen bg-[#EBE1D1] px-4 pb-8 pt-28 text-[#0D4715] md:px-8 md:pt-32">
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
