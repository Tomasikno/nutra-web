import type { MetadataRoute } from "next";
import { buildRecipePath } from "@/lib/recipe-route";
import { buildCanonicalUrl } from "@/lib/seo";
import { supabasePublic } from "@/lib/supabase";

type SitemapRecipeRow = {
  id: string;
  slug: string | null;
  language: string | null;
  updated_at: string | null;
};

function resolveRecipeLocale(language: string | null): string {
  return language === "en" ? "en" : "cs";
}

async function getPublicRecipeRows(): Promise<SitemapRecipeRow[]> {
  if (!supabasePublic) return [];

  const { data, error } = await supabasePublic
    .from("recipes")
    .select("id,slug,language,updated_at")
    .is("deleted_at", null)
    .eq("share_visibility", "PUBLIC")
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return data as SitemapRecipeRow[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: buildCanonicalUrl("/cs"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: buildCanonicalUrl("/en"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: buildCanonicalUrl("/cs/privacy-policy"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: buildCanonicalUrl("/en/privacy-policy"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: buildCanonicalUrl("/cs/cookie-policy"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: buildCanonicalUrl("/en/cookie-policy"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: buildCanonicalUrl("/account-deletion"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const recipes = await getPublicRecipeRows();
  const recipeRoutes: MetadataRoute.Sitemap = recipes
    .filter((recipe) => Boolean(recipe.slug))
    .map((recipe) => ({
      url: buildCanonicalUrl(buildRecipePath(resolveRecipeLocale(recipe.language), recipe.id, recipe.slug)),
      ...(recipe.updated_at ? { lastModified: new Date(recipe.updated_at) } : {}),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...staticRoutes, ...recipeRoutes];
}
