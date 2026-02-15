const RECIPE_ID_PREFIX_PATTERN =
  /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:-|$)/i;
const RECIPE_ROUTE_SLUG_PATTERN =
  /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-(.+)$/i;

export function extractRecipeIdFromRouteSlug(routeSlug: string): string | null {
  const match = routeSlug.match(RECIPE_ID_PREFIX_PATTERN);
  return match ? match[1] : null;
}

export function buildRecipeRouteSlug(recipeId: string, slug: string | null | undefined): string {
  const normalizedRecipeId = recipeId.trim();
  const normalizedSlug = (slug ?? "").trim();

  if (!normalizedSlug) return normalizedRecipeId;
  if (normalizedSlug.toLowerCase() === normalizedRecipeId.toLowerCase()) return normalizedRecipeId;

  const prefixedMatch = normalizedSlug.match(RECIPE_ROUTE_SLUG_PATTERN);
  const slugSuffix = prefixedMatch ? prefixedMatch[2] : normalizedSlug;
  return `${normalizedRecipeId}-${slugSuffix}`;
}

export function buildRecipePath(recipeId: string, slug: string | null | undefined): string {
  return `/r/${buildRecipeRouteSlug(recipeId, slug)}`;
}
