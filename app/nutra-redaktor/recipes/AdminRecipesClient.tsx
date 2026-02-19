
"use client";

import type { Recipe } from "@/lib/recipe-types";
import { coerceHealthBenefits } from "@/lib/recipe-form";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import AdminNav from "../components/AdminNav";
import DeleteRecipeDialog from "../components/DeleteRecipeDialog";

type RecipeWithEmail = Recipe & { user_email: string };


type AdminRecipesClientProps = {
  initialSessionEmail: string | null;
  initialConfigured: boolean;
};

export default function AdminRecipesClient({
  initialSessionEmail,
  initialConfigured,
}: AdminRecipesClientProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(
    initialSessionEmail
  );
  const [configured] = useState(initialConfigured);

  const [recipes, setRecipes] = useState<RecipeWithEmail[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipesError, setRecipesError] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | number | null>(null);
  const [recipePage, setRecipePage] = useState(1);
  const [recipePageSize, setRecipePageSize] = useState(20);
  const [recipeTotal, setRecipeTotal] = useState(0);
  const [showDeleted, setShowDeleted] = useState(false);
  const [showMyRecipes, setShowMyRecipes] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchName, setSearchName] = useState("");
  const [debouncedSearchEmail, setDebouncedSearchEmail] = useState("");
  const [debouncedSearchName, setDebouncedSearchName] = useState("");

  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{
    total: number;
    processed: number;
    generated: number;
    skippedExisting: number;
    skippedInvalid: number;
    failed: number;
    running: boolean;
  } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<RecipeWithEmail | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [recipeMessage, setRecipeMessage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const [thumbnailProgress, setThumbnailProgress] = useState<{
    total: number;
    processed: number;
    generated: number;
    skipped: number;
    failed: number;
    running: boolean;
  } | null>(null);

  const statusMessage = useMemo(
    () =>
      configured
        ? null
        : "Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your server environment to enable admin actions.",
    [configured]
  );

  // Session and config are provided by the server to avoid UI flicker.

  const fetchRecipes = async (options?: {
    includeDeleted?: boolean;
    showMyRecipes?: boolean;
    emailFilter?: string;
    nameFilter?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const includeDeleted = options?.includeDeleted ?? showDeleted;
    const onlyMyRecipes = options?.showMyRecipes ?? showMyRecipes;
    const emailFilter = options?.emailFilter ?? debouncedSearchEmail;
    const nameFilter = options?.nameFilter ?? debouncedSearchName;
    const page = options?.page ?? recipePage;
    const pageSize = options?.pageSize ?? recipePageSize;

    setRecipesLoading(true);
    setRecipesError(null);

    const params = new URLSearchParams();
    params.set("include_deleted", includeDeleted ? "true" : "false");
    params.set("show_all", onlyMyRecipes ? "false" : "true");
    params.set("page", String(page));
    params.set("page_size", String(pageSize));
    if (emailFilter.trim()) {
      params.set("search_email", emailFilter.trim());
    }
    if (nameFilter.trim()) {
      params.set("search_name", nameFilter.trim());
    }

    const response = await fetch(`/api/admin/recipes?${params.toString()}`);
    const payload = (await response.json()) as {
      data?: RecipeWithEmail[];
      message?: string;
      total?: number;
    };

    if (!response.ok) {
      setRecipesError(payload.message ?? "Unable to load recipes.");
      setRecipesLoading(false);
      return;
    }

    const rows = payload.data ?? [];
    setRecipes(rows);
    setSelectedRecipeIds((prev) => {
      if (prev.size === 0) return prev;

      const allowed = new Set(rows.map((row) => String(row.id)));
      const next = new Set<string>();
      prev.forEach((id) => {
        if (allowed.has(id)) {
          next.add(id);
        }
      });

      if (next.size === prev.size) {
        let unchanged = true;
        next.forEach((id) => {
          if (!prev.has(id)) {
            unchanged = false;
          }
        });
        if (unchanged) return prev;
      }

      return next;
    });
    setRecipeTotal(payload.total ?? rows.length);
    setSelectedRecipeId((prev) => {
      if (rows.length === 0) return null;
      return rows.some((row) => row.id === prev) ? prev : rows[0].id;
    });
    setRecipesLoading(false);
  };

  const fetchRecipesRef = useRef(fetchRecipes);
  useEffect(() => {
    fetchRecipesRef.current = fetchRecipes;
  });

  useEffect(() => {
    if (!sessionEmail) return;
    const timeout = window.setTimeout(() => {
      void fetchRecipesRef.current();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [sessionEmail]);

  useEffect(() => {
    if (!sessionEmail) return;
    const timeout = window.setTimeout(() => {
      setDebouncedSearchEmail(searchEmail);
      setDebouncedSearchName(searchName);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [searchEmail, searchName, sessionEmail]);

  useEffect(() => {
    if (!sessionEmail) return;
    const timeout = window.setTimeout(() => {
      setRecipePage(1);
      void fetchRecipesRef.current({
        includeDeleted: showDeleted,
        showMyRecipes,
        emailFilter: debouncedSearchEmail,
        nameFilter: debouncedSearchName,
        page: 1,
      });
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [showDeleted, showMyRecipes, debouncedSearchEmail, debouncedSearchName, sessionEmail]);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const payload = (await response.json()) as { email?: string | null; message?: string };

    if (!response.ok) {
      setAuthError(payload.message ?? "Login failed.");
      setAuthLoading(false);
      return;
    }

    setSessionEmail(payload.email ?? null);
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setSessionEmail(null);
  };

  const selectedRecipe = useMemo(() => {
    if (!selectedRecipeId) return null;
    return recipes.find((item) => item.id === selectedRecipeId) ?? null;
  }, [recipes, selectedRecipeId]);

  const selectAllRef = useRef<HTMLInputElement>(null);

  const selectedRecipeCount = selectedRecipeIds.size;
  const allVisibleSelected =
    recipes.length > 0 && recipes.every((row) => selectedRecipeIds.has(String(row.id)));
  const someVisibleSelected = recipes.some((row) =>
    selectedRecipeIds.has(String(row.id))
  );

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = !allVisibleSelected && someVisibleSelected;
  }, [allVisibleSelected, someVisibleSelected]);

  const toggleRecipeSelection = (id: string) => {
    setSelectedRecipeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedRecipeIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        recipes.forEach((row) => next.delete(String(row.id)));
      } else {
        recipes.forEach((row) => next.add(String(row.id)));
      }
      return next;
    });
  };

  const openDeleteDialog = (recipe: RecipeWithEmail) => {
    setDeleteTarget(recipe);
  };

  const closeDeleteDialog = () => {
    if (deleteLoading) return;
    setDeleteTarget(null);
  };

  const getIngredientStrings = (raw: unknown): string[] => {
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) => {
        if (!item || typeof item !== "object") return "";
        const ingredient = item as { name?: string; amount?: string; unit?: string };
        const parts = [ingredient.amount, ingredient.unit, ingredient.name]
          .filter((value) => typeof value === "string" && value.trim())
          .map((value) => value!.trim());
        return parts.join(" ");
      })
      .filter((value) => value.length > 0);
  };



  const handleDeleteRecipe = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    const response = await fetch(`/api/admin/recipes/${deleteTarget.id}`, {
      method: "DELETE",
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setRecipeMessage(payload.message ?? "Failed to delete recipe.");
      setDeleteLoading(false);
      return;
    }

    setDeleteLoading(false);
    setDeleteTarget(null);
    setRecipeMessage("Recipe deleted.");
    fetchRecipes();
  };

  const handleGenerateImage = async () => {
    if (!selectedRecipe) return;
    if (imageLoading) return;

    const ingredients = getIngredientStrings(selectedRecipe.ingredients);
    if (ingredients.length === 0) {
      setRecipeMessage("Add ingredients before generating an image.");
      return;
    }

    setImageLoading(true);
    setRecipeMessage(null);

    const response = await fetch("/api/admin/recipes/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipe_id: selectedRecipe.id,
        dish_name: selectedRecipe.recipe_name,
        ingredients,
      }),
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setRecipeMessage(payload.message ?? "Failed to generate image.");
      setImageLoading(false);
      return;
    }

    setRecipeMessage("Image generated successfully.");
    setImageLoading(false);
    fetchRecipes();
  };

  const handleBulkAction = async (
    action: "set_private" | "set_unlisted" | "set_public" | "delete" | "generate_images"
  ) => {
    if (selectedRecipeIds.size === 0) return;

    if (action === "generate_images") {
      await handleBulkGenerateImages();
      return;
    }

    if (action === "delete") {
      const shouldDelete = window.confirm(
        `Delete ${selectedRecipeIds.size} recipe${
          selectedRecipeIds.size === 1 ? "" : "s"
        }? This cannot be undone.`
      );
      if (!shouldDelete) return;
    }

    setBulkLoading(true);
    setRecipeMessage(null);

    const response = await fetch("/api/admin/recipes/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        recipeIds: Array.from(selectedRecipeIds),
      }),
    });

    const payload = (await response.json()) as {
      message?: string;
      summary?: string;
    };

    if (!response.ok) {
      setRecipeMessage(payload.message ?? "Bulk action failed.");
      setBulkLoading(false);
      return;
    }

    const verb =
      action === "delete"
        ? "deleted"
        : action === "set_public"
          ? "set to PUBLIC"
          : action === "set_unlisted"
            ? "set to UNLISTED"
            : "set to PRIVATE";

    setRecipeMessage(
      `${selectedRecipeIds.size} recipe${
        selectedRecipeIds.size === 1 ? "" : "s"
      } ${verb}.`
    );
    setSelectedRecipeIds(new Set());
    setBulkLoading(false);
    fetchRecipes();
  };

  const handleBulkGenerateImages = async () => {
    if (selectedRecipeIds.size === 0) return;

    setBulkLoading(true);
    setRecipeMessage(null);
    setBulkProgress({
      total: selectedRecipeIds.size,
      processed: 0,
      generated: 0,
      skippedExisting: 0,
      skippedInvalid: 0,
      failed: 0,
      running: true,
    });

    let processed = 0;
    let generated = 0;
    let skippedExisting = 0;
    let skippedInvalid = 0;
    let failed = 0;

    for (const recipeId of Array.from(selectedRecipeIds)) {
      try {
        const recipeResponse = await fetch(`/api/admin/recipes/${recipeId}`);
        const recipePayload = (await recipeResponse.json()) as { data?: RecipeWithEmail };

        if (!recipeResponse.ok || !recipePayload.data) {
          failed += 1;
          processed += 1;
          setBulkProgress((prev) =>
            prev
              ? { ...prev, processed, failed, running: true }
              : null
          );
          continue;
        }

        const recipe = recipePayload.data;
        if (recipe.photo_url) {
          skippedExisting += 1;
          processed += 1;
          setBulkProgress((prev) =>
            prev
              ? { ...prev, processed, skippedExisting, running: true }
              : null
          );
          continue;
        }

        const dishName = recipe.recipe_name?.trim();
        const ingredients = getIngredientStrings(recipe.ingredients);
        if (!dishName || ingredients.length === 0) {
          skippedInvalid += 1;
          processed += 1;
          setBulkProgress((prev) =>
            prev
              ? { ...prev, processed, skippedInvalid, running: true }
              : null
          );
          continue;
        }

        const generateResponse = await fetch("/api/admin/recipes/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipe_id: recipe.id,
            dish_name: dishName,
            ingredients,
          }),
        });

        if (!generateResponse.ok) {
          failed += 1;
        } else {
          generated += 1;
        }
      } catch {
        failed += 1;
      }

      processed += 1;
      setBulkProgress((prev) =>
        prev
          ? {
              ...prev,
              processed,
              generated,
              skippedExisting,
              skippedInvalid,
              failed,
              running: true,
            }
          : null
      );
    }

    const summary = `Generated ${generated}, skipped existing ${skippedExisting}, skipped invalid ${skippedInvalid}, failed ${failed}.`;
    setRecipeMessage(summary);
    setBulkProgress((prev) =>
      prev
        ? {
            ...prev,
            processed,
            generated,
            skippedExisting,
            skippedInvalid,
            failed,
            running: false,
          }
        : null
    );
    setSelectedRecipeIds(new Set());
    setBulkLoading(false);
    fetchRecipes();
  };

  const handleGenerateThumbnails = async () => {
    setRecipeMessage(null);
    setThumbnailProgress({ total: 0, processed: 0, generated: 0, skipped: 0, failed: 0, running: true });

    // Fetch recipes needing thumbnails
    const listResponse = await fetch("/api/admin/recipes/generate-thumbnails");
    const listPayload = (await listResponse.json()) as {
      data?: { id: string; photo_path: string }[];
      total?: number;
      message?: string;
    };

    if (!listResponse.ok || !listPayload.data) {
      setRecipeMessage(listPayload.message ?? "Failed to fetch recipes needing thumbnails.");
      setThumbnailProgress(null);
      return;
    }

    const pending = listPayload.data;
    if (pending.length === 0) {
      setRecipeMessage("All recipes already have thumbnails.");
      setThumbnailProgress(null);
      return;
    }

    let processed = 0;
    let generated = 0;
    let skipped = 0;
    let failed = 0;

    setThumbnailProgress({ total: pending.length, processed: 0, generated: 0, skipped: 0, failed: 0, running: true });

    for (const recipe of pending) {
      if (!recipe.photo_path) {
        skipped += 1;
        processed += 1;
        setThumbnailProgress((prev) =>
          prev ? { ...prev, processed, skipped, running: true } : null
        );
        continue;
      }

      try {
        const response = await fetch("/api/admin/recipes/generate-thumbnails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipe_id: recipe.id, photo_path: recipe.photo_path }),
        });

        if (!response.ok) {
          failed += 1;
        } else {
          generated += 1;
        }
      } catch {
        failed += 1;
      }

      processed += 1;
      setThumbnailProgress((prev) =>
        prev ? { ...prev, processed, generated, skipped, failed, running: true } : null
      );
    }

    const summary = `Thumbnails: ${generated} generated, ${skipped} skipped, ${failed} failed out of ${pending.length}.`;
    setRecipeMessage(summary);
    setThumbnailProgress((prev) =>
      prev ? { ...prev, processed, generated, skipped, failed, running: false } : null
    );
    fetchRecipes();
  };

  const totalPages = Math.max(1, Math.ceil(recipeTotal / recipePageSize));
  const canGoPrev = recipePage > 1;
  const canGoNext = recipePage < totalPages;

  return (
    <div className="nutra-admin min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400">
            Nutra Kitchen Pass
          </p>
          <h1 className="display-type mt-2 text-4xl font-semibold sm:text-5xl">Recipe Library</h1>
          <p className="mt-3 max-w-2xl text-zinc-300">
            Browse recipes, view details, and manage existing content.
          </p>
        </header>

        {statusMessage && (
          <div className="rounded-2xl border border-amber-400/50 bg-amber-500/10 p-5 text-amber-100">
            {statusMessage}
          </div>
        )}

        {!sessionEmail ? (
          <div className="grid gap-6">
            <form
              onSubmit={handleSignIn}
              className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8"
            >
              <h2 className="text-2xl font-semibold text-white">Admin Login</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Use your Supabase admin credentials.
              </p>
              <div className="mt-6 flex flex-col gap-4">
                <label className="flex flex-col gap-2 text-sm">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                    required
                  />
                </label>
                {authError && (
                  <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {authError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={authLoading || !configured}
                  className="mt-2 inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/40"
                >
                  {authLoading ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <AdminNav sessionEmail={sessionEmail} onSignOut={handleSignOut} />

            <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Recipes</h2>
                    <p className="mt-2 text-sm text-zinc-400">
                      {showMyRecipes && !searchEmail
                        ? "Showing your recipes only."
                        : "Browse all recipes in the database."}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-zinc-300">
                      <input
                        type="checkbox"
                        checked={showMyRecipes}
                        onChange={(event) => setShowMyRecipes(event.target.checked)}
                        className="h-4 w-4 rounded border border-zinc-700 bg-zinc-950 text-emerald-400"
                      />
                      Show My Recipes
                    </label>
                    <label className="flex items-center gap-2 text-xs text-zinc-300">
                      <input
                        type="checkbox"
                        checked={showDeleted}
                        onChange={(event) => setShowDeleted(event.target.checked)}
                        className="h-4 w-4 rounded border border-zinc-700 bg-zinc-950 text-emerald-400"
                      />
                      Show Deleted
                    </label>
                    <button
                      type="button"
                      onClick={() => fetchRecipes()}
                      className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-200"
                    >
                      Refresh
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateThumbnails}
                      disabled={thumbnailProgress?.running}
                      className="rounded-full border border-emerald-400/60 px-4 py-2 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-500"
                    >
                      {thumbnailProgress?.running ? "Generating..." : "Generate Thumbnails"}
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={searchName}
                      onChange={(event) => setSearchName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          setDebouncedSearchEmail(searchEmail);
                          setDebouncedSearchName(searchName);
                          setRecipePage(1);
                          fetchRecipes({
                            page: 1,
                            emailFilter: searchEmail,
                            nameFilter: searchName,
                          });
                        }
                      }}
                      placeholder="Search by recipe name..."
                      className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={searchEmail}
                      onChange={(event) => setSearchEmail(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          setDebouncedSearchEmail(searchEmail);
                          setDebouncedSearchName(searchName);
                          setRecipePage(1);
                          fetchRecipes({
                            page: 1,
                            emailFilter: searchEmail,
                            nameFilter: searchName,
                          });
                        }
                      }}
                      placeholder="Search by user email..."
                      className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDebouncedSearchEmail(searchEmail);
                        setDebouncedSearchName(searchName);
                        setRecipePage(1);
                        fetchRecipes({
                          page: 1,
                          emailFilter: searchEmail,
                          nameFilter: searchName,
                        });
                      }}
                      className="rounded-full border border-emerald-400/60 px-4 py-2 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300 hover:text-white"
                    >
                      Search
                    </button>
                    {(searchEmail || searchName) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchEmail("");
                          setSearchName("");
                          setDebouncedSearchEmail("");
                          setDebouncedSearchName("");
                          setRecipePage(1);
                          fetchRecipes({ emailFilter: "", nameFilter: "", page: 1 });
                        }}
                        className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-500"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                {recipeMessage && (
                  <p className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    {recipeMessage}
                  </p>
                )}
                {bulkProgress && (
                  <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-200">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>
                        {bulkProgress.running ? "Generating images..." : "Bulk generation complete"}
                      </span>
                      <span>
                        {bulkProgress.processed}/{bulkProgress.total}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full bg-emerald-400 transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((bulkProgress.processed / bulkProgress.total) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-zinc-400">
                      Generated {bulkProgress.generated}, skipped existing {bulkProgress.skippedExisting},
                      skipped invalid {bulkProgress.skippedInvalid}, failed {bulkProgress.failed}.
                    </div>
                  </div>
                )}
                {thumbnailProgress && (
                  <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-200">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>
                        {thumbnailProgress.running ? "Generating thumbnails..." : "Thumbnail generation complete"}
                      </span>
                      <span>
                        {thumbnailProgress.processed}/{thumbnailProgress.total}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full bg-emerald-400 transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            thumbnailProgress.total > 0
                              ? Math.round((thumbnailProgress.processed / thumbnailProgress.total) * 100)
                              : 0
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-zinc-400">
                      Generated {thumbnailProgress.generated}, skipped {thumbnailProgress.skipped},
                      failed {thumbnailProgress.failed}.
                    </div>
                  </div>
                )}

                <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-zinc-300">
                      {selectedRecipeCount > 0
                        ? `${selectedRecipeCount} selected`
                        : "Select recipes to bulk edit."}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleBulkAction("set_private")}
                        disabled={selectedRecipeCount === 0 || bulkLoading}
                        className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-200 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-500"
                      >
                        {bulkLoading ? "Working..." : "Private"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkAction("set_unlisted")}
                        disabled={selectedRecipeCount === 0 || bulkLoading}
                        className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-200 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-500"
                      >
                        Unlisted
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkAction("set_public")}
                        disabled={selectedRecipeCount === 0 || bulkLoading}
                        className="rounded-full border border-emerald-400/60 px-3 py-1 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-500"
                      >
                        Public
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkAction("delete")}
                        disabled={selectedRecipeCount === 0 || bulkLoading}
                        className="rounded-full border border-rose-400/50 px-3 py-1 text-xs font-semibold text-rose-100 transition hover:border-rose-300 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-500"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkAction("generate_images")}
                        disabled={selectedRecipeCount === 0 || bulkLoading}
                        className="rounded-full border border-emerald-400/60 px-3 py-1 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-500"
                      >
                        {bulkLoading ? "Working..." : "Generate Images"}
                      </button>
                    </div>
                  </div>
                </div>

<div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800">
                  <div className="max-h-[420px] overflow-auto">
                    <table className="w-full text-left text-sm">

                      <thead className="sticky top-0 bg-zinc-900/90 text-xs uppercase text-zinc-400">
                        <tr>
                          <th className="px-4 py-3">
                            <input
                              ref={selectAllRef}
                              type="checkbox"
                              checked={allVisibleSelected}
                              onChange={toggleSelectAllVisible}
                              className="h-4 w-4 rounded border border-zinc-700 bg-zinc-950 text-emerald-400"
                            />
                          </th>
                          <th className="px-4 py-3 font-semibold">Name</th>
                          <th className="px-4 py-3 font-semibold">Email</th>
                          <th className="px-4 py-3 font-semibold">Visibility</th>
                          <th className="px-4 py-3 font-semibold">Updated</th>
                          <th className="px-4 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>

<tbody className="divide-y divide-zinc-800">
                        {recipesLoading && (
                          <tr>
                            <td colSpan={6} className="px-4 py-6 text-center text-zinc-400">
                              Loading recipes...
                            </td>
                          </tr>
                        )}
                        {recipesError && (
                          <tr>
                            <td colSpan={6} className="px-4 py-6 text-center text-rose-200">
                              {recipesError}
                            </td>
                          </tr>
                        )}
                        {!recipesLoading && !recipesError && recipes.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                              No recipes found yet.
                            </td>
                          </tr>
                        )}
                        {recipes.map((row) => {
                          const key = row.id;
                          const isSelected = row.id === selectedRecipeId;
                          return (
                            <tr
                              key={key}
                              className={`cursor-pointer transition ${isSelected ? "bg-emerald-500/10" : "hover:bg-zinc-950/40"
                                }`}
                              onClick={() => setSelectedRecipeId(row.id)}
                            >

                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={selectedRecipeIds.has(String(row.id))}
                                  onChange={(event) => {
                                    event.stopPropagation();
                                    toggleRecipeSelection(String(row.id));
                                  }}
                                  className="h-4 w-4 rounded border border-zinc-700 bg-zinc-950 text-emerald-400"
                                />
                              </td>
                              <td className="px-4 py-3 font-semibold text-white">
                                {row.recipe_name ?? "Untitled"}
                              </td>

<td className="px-4 py-3 text-zinc-400">{row.user_email}</td>
                              <td className="px-4 py-3 text-zinc-300">
                                {row.share_visibility}
                              </td>
                              <td className="px-4 py-3 text-zinc-400">
                                {row.updated_at
                                  ? new Date(row.updated_at).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      router.push(`/nutra-redaktor/recipes/${row.id}/edit`);
                                    }}
                                    className="rounded-full border border-emerald-400/60 px-3 py-1 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300 hover:text-white"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      openDeleteDialog(row);
                                    }}
                                    className="rounded-full border border-rose-400/50 px-3 py-1 text-xs font-semibold text-rose-100 transition hover:border-rose-300 hover:text-white"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span>Rows per page</span>
                    <select
                      value={recipePageSize}
                      onChange={(event) => {
                        const nextSize = Number(event.target.value);
                        setRecipePageSize(nextSize);
                        setRecipePage(1);
                        fetchRecipes({ page: 1, pageSize: nextSize });
                      }}
                      className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-zinc-200 focus:border-emerald-400 focus:outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!canGoPrev) return;
                        const nextPage = recipePage - 1;
                        setRecipePage(nextPage);
                        fetchRecipes({ page: nextPage });
                      }}
                      disabled={!canGoPrev}
                      className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-200 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-500"
                    >
                      Prev
                    </button>
                    <span>
                      Page {recipePage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (!canGoNext) return;
                        const nextPage = recipePage + 1;
                        setRecipePage(nextPage);
                        fetchRecipes({ page: nextPage });
                      }}
                      disabled={!canGoNext}
                      className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-200 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-500"
                    >
                      Next
                    </button>
                    <span>{recipeTotal} total</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8">
                <h2 className="text-2xl font-semibold text-white">Recipe Details</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Select a recipe to inspect its full details.
                </p>
                {!selectedRecipe && (
                  <p className="mt-6 text-sm text-zinc-500">No recipe selected.</p>
                )}
                {selectedRecipe && (
                  <div className="mt-6 space-y-6 text-sm text-zinc-200">
                    <div>
                      <p className="text-xs uppercase text-zinc-500">Recipe Name</p>
                      <p className="text-base font-semibold text-white">
                        {selectedRecipe.recipe_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-zinc-500">Description</p>
                      <p className="text-zinc-200">
                        {selectedRecipe.description || "No description provided."}
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase text-zinc-500">Servings</p>
                        <p className="text-zinc-200">{selectedRecipe.servings}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-zinc-500">Difficulty</p>
                        <p className="text-zinc-200">{selectedRecipe.difficulty}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-zinc-500">Prep Time</p>
                        <p className="text-zinc-200">
                          {selectedRecipe.prep_time_minutes} min
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-zinc-500">Cook Time</p>
                        <p className="text-zinc-200">
                          {selectedRecipe.cook_time_minutes} min
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-zinc-500">Time of Day</p>
                        <p className="text-zinc-200">
                          {selectedRecipe.time_of_day?.length ? selectedRecipe.time_of_day.join(", ") : "Unspecified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-zinc-500">Portion Size</p>
                        <p className="text-zinc-200">
                          {selectedRecipe.portion_size ?? "Unspecified"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-zinc-500">Ingredients</p>
                      <ul className="mt-2 list-disc pl-5 text-zinc-200">
                        {(selectedRecipe.ingredients as { name?: string; amount?: string; unit?: string }[])
                          ?.map((ingredient, index) => (
                            <li key={`${ingredient.name}-${index}`}>
                              {ingredient.name}
                              {ingredient.amount ? ` - ${ingredient.amount}` : ""}
                              {ingredient.unit ? ` ${ingredient.unit}` : ""}
                            </li>
                          ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-zinc-500">Steps</p>
                      <ol className="mt-2 list-decimal pl-5 text-zinc-200">
                        {(selectedRecipe.steps as string[])?.map((step, index) => (
                          <li key={`step-${index}`}>{step}</li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-zinc-500">Nutrition</p>
                      <div className="mt-2 grid gap-2 text-zinc-200 sm:grid-cols-2">
                        {(() => {
                          if (!selectedRecipe.nutrition || typeof selectedRecipe.nutrition !== "object") {
                            return null;
                          }

                          const nutrition = selectedRecipe.nutrition as Record<string, unknown>;

                          const renderScalar = (value: unknown) => {
                            if (typeof value === "number") return String(value);
                            if (typeof value === "string") return value;
                            if (value === 0) return "0";
                            if (value === false) return "false";
                            if (value === null) return "—";
                            return "—";
                          };

                          const labelFor = (rawKey: string) => {
                            const map: Record<string, string> = {
                              perServing: "Per Serving",
                              total: "Total",
                              notes: "Notes",
                              source: "Source",
                              calories: "Calories",
                              proteinG: "Protein (g)",
                              fatG: "Fat (g)",
                              carbsG: "Carbs (g)",
                              fiberG: "Fiber (g)",
                              sugarG: "Sugar (g)",
                              saltG: "Salt (g)",
                            };
                            return map[rawKey] ?? rawKey.replace(/([a-z])([A-Z])/g, "$1 $2");
                          };

                          const orderedKeys = ["notes", "source", "total", "perServing"];
                          const entries = Object.entries(nutrition).sort(([a], [b]) => {
                            const aIndex = orderedKeys.indexOf(a);
                            const bIndex = orderedKeys.indexOf(b);
                            if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
                            if (aIndex === -1) return 1;
                            if (bIndex === -1) return -1;
                            return aIndex - bIndex;
                          });

                          return entries.map(([key, value]) => {
                            if (key === "notes" || key === "source") {
                              return (
                                <div key={key} className="flex flex-col gap-1">
                                  <span className="text-xs uppercase text-zinc-500">{labelFor(key)}</span>
                                  <span className="text-sm text-zinc-200">{renderScalar(value)}</span>
                                </div>
                              );
                            }

                            if (value && typeof value === "object" && !Array.isArray(value)) {
                              const sectionEntries = Object.entries(
                                value as Record<string, unknown>
                              ).sort(([a], [b]) => a.localeCompare(b));
                              const isWideSection = key === "total" || key === "perServing";
                              return (
                                <div
                                  key={key}
                                  className={`rounded-xl border border-zinc-800 bg-zinc-950/20 p-3 ${
                                    isWideSection ? "sm:col-span-2" : ""
                                  }`}
                                >
                                  <p className="text-xs uppercase text-zinc-500">{labelFor(key)}</p>
                                  <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                                    {sectionEntries.map(([subKey, subValue]) => (
                                      <div
                                        key={`${key}-${subKey}`}
                                        className="flex items-center justify-between text-zinc-200"
                                      >
                                        <span>{labelFor(subKey)}</span>
                                        <span className="text-right">
                                          {renderScalar(subValue)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div key={key} className="flex items-center justify-between">
                                <span className="capitalize">{labelFor(key)}</span>
                                <span className="text-right">{renderScalar(value)}</span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-zinc-500">Health Score</p>
                      <p className="text-zinc-200">{selectedRecipe.health_score}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-zinc-500">Health Benefits</p>
                      {(() => {
                        const benefits = coerceHealthBenefits(selectedRecipe.health_benefits);
                        if (!benefits.length) {
                          return <p className="mt-2 text-zinc-500">No benefits listed.</p>;
                        }

                        return (
                          <ul className="mt-2 list-disc pl-5 text-zinc-200">
                            {benefits.map((benefit, index) => (
                              <li key={`${benefit.benefit}-${index}`}>
                                {benefit.benefit}
                                {benefit.description ? ` - ${benefit.description}` : ""}
                              </li>
                            ))}
                          </ul>
                        );
                      })()}
                    </div>
                    <div>
                      <p className="text-xs uppercase text-zinc-500">Warnings</p>
                      {(() => {
                        const rawWarnings = selectedRecipe.warnings;
                        let warnings: Array<string | { type?: string; message?: string }> = [];
                        if (Array.isArray(rawWarnings)) {
                          warnings = rawWarnings as Array<string | { type?: string; message?: string }>;
                        } else if (typeof rawWarnings === "string") {
                          try {
                            const parsed = JSON.parse(rawWarnings);
                            if (Array.isArray(parsed)) {
                              warnings = parsed as Array<string | { type?: string; message?: string }>;
                            }
                          } catch {
                            warnings = [];
                          }
                        }

                        if (!warnings.length) {
                          return <p className="mt-2 text-zinc-500">No warnings listed.</p>;
                        }

                        return (
                          <ul className="mt-2 list-disc pl-5 text-zinc-200">
                            {warnings.map((warning, index) => {
                              if (typeof warning === "string") {
                                return <li key={`warning-${index}`}>{warning}</li>;
                              }
                              return (
                                <li key={`${warning.type ?? "warning"}-${index}`}>
                                  {warning.type}
                                  {warning.message ? ` - ${warning.message}` : ""}
                                </li>
                              );
                            })}
                          </ul>
                        );
                      })()}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase text-zinc-500">Dietary Tags</p>
                        <p className="text-zinc-200">
                          {selectedRecipe.dietary_tags?.length
                            ? selectedRecipe.dietary_tags.join(", ")
                            : "None"}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase text-zinc-500">Photo URL</p>
                        <p className="text-zinc-200 break-all">
                          {selectedRecipe.photo_url ?? "None"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-zinc-500">Photo Moderation</p>
                        <p className="text-zinc-200">
                          {selectedRecipe.photo_moderation_status ?? "-"}
                        </p>
                      </div>
                    </div>
                    {selectedRecipe.photo_url && (
                      <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-zinc-800">
                        <Image
                          src={selectedRecipe.photo_url}
                          alt={selectedRecipe.recipe_name}
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleGenerateImage}
                        disabled={imageLoading}
                        className="rounded-full border border-emerald-400/60 px-4 py-2 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-500"
                      >
                        {imageLoading ? "Generating..." : "Generate Image"}
                      </button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase text-zinc-500">Created At</p>
                        <p className="text-zinc-200">{selectedRecipe.created_at}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-zinc-500">Updated At</p>
                        <p className="text-zinc-200">{selectedRecipe.updated_at}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/nutra-redaktor/recipes/${selectedRecipe.id}/edit`)
                        }
                        className="rounded-full border border-emerald-400/60 px-4 py-2 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300 hover:text-white"
                      >
                        Edit Recipe
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteDialog(selectedRecipe)}
                        className="rounded-full border border-rose-400/50 px-4 py-2 text-xs font-semibold text-rose-100 transition hover:border-rose-300 hover:text-white"
                      >
                        Delete Recipe
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      <DeleteRecipeDialog
        key={deleteTarget ? String(deleteTarget.id) : "delete-dialog-closed"}
        isOpen={Boolean(deleteTarget)}
        recipeName={deleteTarget?.recipe_name ?? ""}
        onCancel={closeDeleteDialog}
        onConfirm={handleDeleteRecipe}
        isLoading={deleteLoading}
      />
    </div>
  );
}
