import { notFound, permanentRedirect } from "next/navigation";
import type { Locale } from "@/i18n/request";
import { buildRecipePath, extractRecipeIdFromRouteSlug } from "@/lib/recipe-route";
import { supabasePublic } from "@/lib/supabase";

/**
 * Legacy redirect: /r/{slug} → /{locale}/r/{slug}
 * Preserves SEO juice from old URLs by issuing a 308 permanent redirect
 * to the new locale-prefixed route.
 */

type PageParams = { slug: string };
type RecipeMinimal = { id: string; slug: string | null; language: string | null };

function resolveLocale(language: string | null): Locale {
  return language === "en" ? "en" : "cs";
}

async function findRecipe(routeSlug: string): Promise<RecipeMinimal | null> {
  if (!supabasePublic) return null;

  const recipeId = extractRecipeIdFromRouteSlug(routeSlug);
  if (recipeId) {
    const { data } = await supabasePublic
      .from("recipes")
      .select("id, slug, language")
      .eq("id", recipeId)
      .is("deleted_at", null)
      .in("share_visibility", ["PUBLIC", "UNLISTED"])
      .single();
    if (data) return data as RecipeMinimal;
  }

  const { data: bySlug } = await supabasePublic
    .from("recipes")
    .select("id, slug, language")
    .eq("slug", routeSlug)
    .is("deleted_at", null)
    .in("share_visibility", ["PUBLIC", "UNLISTED"])
    .single();
  if (bySlug) return bySlug as RecipeMinimal;

  const { data: bySuffix } = await supabasePublic
    .from("recipes")
    .select("id, slug, language")
    .ilike("slug", `%-${routeSlug}`)
    .is("deleted_at", null)
    .in("share_visibility", ["PUBLIC", "UNLISTED"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (bySuffix as RecipeMinimal) ?? null;
}

export default async function LegacyRecipeRedirect({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const recipe = await findRecipe(slug);
  if (!recipe) notFound();

  const locale = resolveLocale(recipe.language);
  permanentRedirect(buildRecipePath(locale, recipe.id, recipe.slug));
}
