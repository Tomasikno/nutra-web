"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Recipe, RecipeFormData } from "@/lib/recipe-types";
import { DEFAULT_NUTRITION, EMPTY_RECIPE_FORM } from "@/lib/recipe-types";
import { buildNutritionPayload, coerceNutritionInfo } from "@/lib/recipe-nutrition";
import { coerceHealthBenefits, coerceWarnings } from "@/lib/recipe-form";
import RecipeFormTabs from "@/app/nutra-redaktor/components/RecipeFormTabs";

const createEmptyRecipeForm = (): RecipeFormData => ({
  ...EMPTY_RECIPE_FORM,
  nutrition: { ...DEFAULT_NUTRITION },
  ingredients: [],
  steps: [],
  health_benefits: [],
  warnings: [],
  dietary_tags: [],
  meal_categories: [],
});

const normalizeRecipeForm = (form: RecipeFormData) => {
  const normalizedLanguage =
    form.language === "cs" || form.language === "en" ? form.language : null;

  const ingredients = form.ingredients
    .map((item) => ({
      ...item,
      name: item.name?.trim(),
      amount: item.amount?.trim(),
      unit: item.unit?.trim(),
    }))
    .filter((item) => item.name);

  const steps = form.steps.map((step) => step.trim()).filter(Boolean);

  const health_benefits = form.health_benefits
    .map((benefit) => ({
      ...benefit,
      benefit: benefit.benefit?.trim(),
      description: benefit.description?.trim(),
    }))
    .filter((benefit) => benefit.benefit || benefit.description);

  const warnings = form.warnings
    .map((warning) => ({
      ...warning,
      type: warning.type?.trim(),
      message: warning.message?.trim(),
    }))
    .filter((warning) => warning.type || warning.message);

  return {
    ...form,
    recipe_name: form.recipe_name.trim(),
    description: form.description.trim(),
    portion_size: form.portion_size ? form.portion_size.trim() : null,
    language: normalizedLanguage,
    ingredients,
    steps,
    health_benefits,
    warnings,
    dietary_tags: form.dietary_tags.map((tag) => tag.trim()).filter(Boolean),
    meal_categories: form.meal_categories.map((tag) => tag.trim()).filter(Boolean),
  };
};

const validateRecipeForm = (form: RecipeFormData) => {
  const errors: Record<string, string> = {};

  if (!form.recipe_name.trim()) {
    errors.recipe_name = "Recipe name is required.";
  }
  if (!form.description.trim()) {
    errors.description = "Description is required.";
  }
  if (!Number.isFinite(form.servings) || form.servings < 1) {
    errors.servings = "Servings must be at least 1.";
  }
  if (!Number.isFinite(form.prep_time_minutes) || form.prep_time_minutes < 0) {
    errors.prep_time_minutes = "Prep time must be 0 or more.";
  }
  if (!Number.isFinite(form.cook_time_minutes) || form.cook_time_minutes < 0) {
    errors.cook_time_minutes = "Cook time must be 0 or more.";
  }
  if (!form.difficulty) {
    errors.difficulty = "Difficulty is required.";
  }
  if (!form.ingredients.length || !form.ingredients.some((item) => item.name?.trim())) {
    errors.ingredients = "At least one ingredient is required.";
  }
  if (!form.steps.length || !form.steps.some((step) => step.trim())) {
    errors.steps = "At least one step is required.";
  }

  const nutrition = form.nutrition;
  const nutritionFields = [
    nutrition.calories,
    nutrition.protein,
    nutrition.carbs,
    nutrition.fat,
    nutrition.fiber,
    nutrition.sugar,
  ];
  if (nutritionFields.some((value) => !Number.isFinite(value))) {
    errors.nutrition = "Nutrition must include all values.";
  }

  if (!Number.isFinite(form.health_score) || form.health_score < 0 || form.health_score > 100) {
    errors.health_score = "Health score must be between 0 and 100.";
  }

  return errors;
};

const toFormData = (recipe: Recipe): RecipeFormData => {
  const language = recipe.language === "cs" || recipe.language === "en" ? recipe.language : null;

  return {
    recipe_name: recipe.recipe_name,
    description: recipe.description ?? "",
    servings: recipe.servings,
  prep_time_minutes: recipe.prep_time_minutes,
  cook_time_minutes: recipe.cook_time_minutes,
  difficulty: recipe.difficulty,
  portion_size: recipe.portion_size ?? null,
  ingredients: (recipe.ingredients as RecipeFormData["ingredients"]) ?? [],
  steps: (recipe.steps as RecipeFormData["steps"]) ?? [],
  nutrition: coerceNutritionInfo(recipe.nutrition ?? DEFAULT_NUTRITION),
  health_benefits: coerceHealthBenefits(recipe.health_benefits),
  warnings: coerceWarnings(recipe.warnings),
  health_score: recipe.health_score,
  dietary_tags: recipe.dietary_tags ?? [],
    meal_categories: recipe.meal_categories ?? [],
    time_of_day: recipe.time_of_day ?? null,
    share_visibility: recipe.share_visibility,
    language,
  };
};

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams<{ id: string | string[] }>();
  const recipeId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const [formData, setFormData] = useState<RecipeFormData>(createEmptyRecipeForm());
  const [recipeMeta, setRecipeMeta] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoModerationReason, setPhotoModerationReason] = useState<string | null>(null);
  const [imageGenerating, setImageGenerating] = useState(false);
  const [imageMessage, setImageMessage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (!recipeId) return;

    const fetchRecipe = async () => {
      setLoading(true);
      const response = await fetch(`/api/admin/recipes/${recipeId}`);
      const payload = (await response.json()) as { data?: Recipe; message?: string };

      if (!response.ok || !payload.data) {
        setError(payload.message ?? "Failed to load recipe.");
        setLoading(false);
        return;
      }

      setRecipeMeta(payload.data);
      setFormData(toFormData(payload.data));
      setError(null);
      setLoading(false);
    };

    fetchRecipe();
  }, [recipeId]);

  const pageTitle = useMemo(
    () => (recipeMeta?.recipe_name ? `Edit ${recipeMeta.recipe_name}` : "Edit Recipe"),
    [recipeMeta?.recipe_name]
  );

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!recipeId) {
      setError("Missing recipe id.");
      return;
    }

    const normalized = normalizeRecipeForm(formData);
    const nextErrors = validateRecipeForm(normalized);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setError("Fix the highlighted fields before saving.");
      return;
    }

    setErrors({});
    setSaving(true);

    const response = await fetch(`/api/admin/recipes/${recipeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...normalized,
        nutrition: buildNutritionPayload(normalized, recipeMeta?.nutrition),
      }),
    });

    const payload = (await response.json()) as { message?: string; data?: Recipe };

    if (!response.ok) {
      setError(payload.message ?? "Failed to update recipe.");
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push("/nutra-redaktor");
  };

  const handlePhotoSelect = async (file: File) => {
    if (!recipeId) {
      setPhotoError("Missing recipe id.");
      return;
    }

    setPhotoUploading(true);
    setPhotoError(null);
    setPhotoModerationReason(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("recipe_id", recipeId);

    const response = await fetch("/api/admin/recipes/upload-photo", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as {
      message?: string;
      photo_url?: string;
      photo_path?: string;
      photo_width?: number | null;
      photo_height?: number | null;
      photo_size_bytes?: number;
      photo_moderation_status?: string | null;
      photo_moderated_at?: string | null;
      moderation?: { reason?: string };
    };

    if (!response.ok || !payload.photo_url || !payload.photo_path) {
      setPhotoError(payload.message ?? "Photo upload failed.");
      setPhotoUploading(false);
      return;
    }

    setRecipeMeta((prev) =>
      prev
        ? {
            ...prev,
            photo_url: payload.photo_url ?? prev.photo_url,
            photo_path: payload.photo_path ?? prev.photo_path,
            photo_width: payload.photo_width ?? prev.photo_width,
            photo_height: payload.photo_height ?? prev.photo_height,
            photo_size_bytes: payload.photo_size_bytes ?? prev.photo_size_bytes,
            photo_moderation_status:
              payload.photo_moderation_status ?? prev.photo_moderation_status,
            photo_moderated_at: payload.photo_moderated_at ?? prev.photo_moderated_at,
          }
        : prev
    );
    setPhotoModerationReason(payload.moderation?.reason ?? null);
    setPhotoUploading(false);
  };

  const buildIngredientList = (ingredients: RecipeFormData["ingredients"]) => {
    return ingredients
      .map((item) => {
        const parts = [item.amount?.trim(), item.unit?.trim(), item.name?.trim()]
          .filter((value) => value && value.length > 0);
        return parts.join(" ");
      })
      .filter((value) => value.length > 0);
  };

  const handleGenerateImage = async () => {
    if (!recipeId) {
      setImageError("Missing recipe id.");
      return;
    }

    const dishName = formData.recipe_name.trim();
    if (!dishName) {
      setImageError("Recipe name is required.");
      return;
    }

    const ingredients = buildIngredientList(formData.ingredients);
    if (ingredients.length === 0) {
      setImageError("Add ingredients before generating an image.");
      return;
    }

    setImageGenerating(true);
    setImageError(null);
    setImageMessage(null);

    const response = await fetch("/api/admin/recipes/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipe_id: recipeId,
        dish_name: dishName,
        ingredients,
      }),
    });

    const payload = (await response.json()) as {
      message?: string;
      photo_url?: string;
      photo_path?: string;
      photo_width?: number;
      photo_height?: number;
      photo_size_bytes?: number;
    };

    if (!response.ok) {
      setImageError(payload.message ?? "Failed to generate image.");
      setImageGenerating(false);
      return;
    }

    setRecipeMeta((prev) =>
      prev
        ? {
            ...prev,
            photo_url: payload.photo_url ?? prev.photo_url,
            photo_path: payload.photo_path ?? prev.photo_path,
            photo_width: payload.photo_width ?? prev.photo_width,
            photo_height: payload.photo_height ?? prev.photo_height,
            photo_size_bytes: payload.photo_size_bytes ?? prev.photo_size_bytes,
          }
        : prev
    );
    setImageMessage("Image generated successfully.");
    setImageGenerating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-100">
        <div className="mx-auto w-full max-w-4xl rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8">
          <p className="text-sm text-zinc-400">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error && !recipeMeta) {
    return (
      <div className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-100">
        <div className="mx-auto w-full max-w-4xl rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8">
          <p className="text-sm text-rose-200">{error}</p>
          <button
            type="button"
            onClick={() => router.push("/nutra-redaktor")}
            className="mt-4 rounded-full border border-zinc-700 px-5 py-2 text-sm font-semibold text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-200"
          >
            Back to Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-100">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
              Nutra Admin
            </p>
            <h1 className="text-3xl font-semibold text-white">{pageTitle}</h1>
          </div>
          <button
            type="button"
            onClick={() => router.push("/nutra-redaktor")}
            className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-semibold text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-200"
          >
            Back to Admin
          </button>
        </div>

        <form
          onSubmit={handleSave}
          className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8"
        >
          <p className="text-sm text-zinc-400">
            Update all recipe fields. Changes will sync to Supabase immediately.
          </p>
          {error && (
            <p className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          )}
          <RecipeFormTabs
            value={formData}
            onChange={setFormData}
            errors={errors}
            metadata={recipeMeta}
            photoUpload={{
              photoUrl: recipeMeta?.photo_url ?? null,
              photoPath: recipeMeta?.photo_path ?? null,
              photoWidth: recipeMeta?.photo_width ?? null,
              photoHeight: recipeMeta?.photo_height ?? null,
              photoSizeBytes: recipeMeta?.photo_size_bytes ?? null,
              moderationStatus: recipeMeta?.photo_moderation_status ?? null,
              moderationReason: photoModerationReason,
              uploading: photoUploading,
              error: photoError,
              onSelectFile: handlePhotoSelect,
            }}
          />
          {imageMessage && (
            <p className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {imageMessage}
            </p>
          )}
          {imageError && (
            <p className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {imageError}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/40"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleGenerateImage}
              disabled={imageGenerating}
              className="rounded-full border border-emerald-400/60 px-5 py-2 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-500"
            >
              {imageGenerating ? "Generating..." : "Generate Image"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/nutra-redaktor")}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-semibold text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
