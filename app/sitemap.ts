import type { MetadataRoute } from "next";
import { buildCanonicalUrl } from "@/lib/seo";
import { supabasePublic } from "@/lib/supabase";

type SitemapRecipeRow = {
  slug: string | null;
  updated_at: string | null;
};

async function getPublicRecipeRows(): Promise<SitemapRecipeRow[]> {
  if (!supabasePublic) return [];

  const { data, error } = await supabasePublic
    .from("recipes")
    .select("slug,updated_at")
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
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: buildCanonicalUrl("/en"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: buildCanonicalUrl("/cs/privacy-policy"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: buildCanonicalUrl("/en/privacy-policy"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: buildCanonicalUrl("/account-deletion"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const recipes = await getPublicRecipeRows();
  const recipeRoutes: MetadataRoute.Sitemap = recipes
    .filter((recipe) => Boolean(recipe.slug))
    .map((recipe) => ({
      url: buildCanonicalUrl(`/r/${recipe.slug}`),
      ...(recipe.updated_at ? { lastModified: new Date(recipe.updated_at) } : {}),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...staticRoutes, ...recipeRoutes];
}
