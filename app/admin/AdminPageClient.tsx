"use client";

import { useMemo, useState } from "react";
import type { RecipeFormData } from "@/lib/recipe-types";
import { DEFAULT_NUTRITION, EMPTY_RECIPE_FORM } from "@/lib/recipe-types";
import { buildNutritionPayload } from "@/lib/recipe-nutrition";
import AdminNav from "./components/AdminNav";
import RecipeFormTabs from "./components/RecipeFormTabs";

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

  if (!Array.isArray(form.dietary_tags)) {
    errors.dietary_tags = "Dietary tags must be an array.";
  }

  if (!Array.isArray(form.meal_categories)) {
    errors.meal_categories = "Meal categories must be an array.";
  }

  return errors;
};

type AdminPageClientProps = {
  initialSessionEmail: string | null;
  initialConfigured: boolean;
};

export default function AdminPageClient({
  initialSessionEmail,
  initialConfigured,
}: AdminPageClientProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(
    initialSessionEmail
  );
  const [configured] = useState(initialConfigured);

  const [recipeForm, setRecipeForm] = useState<RecipeFormData>(createEmptyRecipeForm());
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeMessage, setRecipeMessage] = useState<string | null>(null);
  const [recipeErrors, setRecipeErrors] = useState<Record<string, string>>({});

  const [photoInfo, setPhotoInfo] = useState<{
    photo_url: string;
    photo_path: string;
    photo_width: number | null;
    photo_height: number | null;
    photo_size_bytes: number;
    photo_moderation_status: string | null;
    photo_moderated_at: string | null;
  } | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoModerationReason, setPhotoModerationReason] = useState<string | null>(null);

  const statusMessage = useMemo(
    () =>
      configured
        ? null
        : "Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your server environment to enable admin actions.",
    [configured]
  );

  // Session and config are provided by the server to avoid UI flicker.

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

  const handleCreateRecipe = async (event: React.FormEvent) => {
    event.preventDefault();
    setRecipeMessage(null);

    const normalized = normalizeRecipeForm(recipeForm);
    const errors = validateRecipeForm(normalized);
    if (Object.keys(errors).length > 0) {
      setRecipeErrors(errors);
      setRecipeMessage("Fix the highlighted fields before saving.");
      return;
    }

    setRecipeErrors({});
    setRecipeLoading(true);

    const response = await fetch("/api/admin/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...normalized,
        nutrition: buildNutritionPayload(normalized),
        ...(photoInfo
          ? {
              photo_url: photoInfo.photo_url,
              photo_path: photoInfo.photo_path,
              photo_width: photoInfo.photo_width,
              photo_height: photoInfo.photo_height,
              photo_size_bytes: photoInfo.photo_size_bytes,
              photo_moderation_status: photoInfo.photo_moderation_status,
              photo_moderated_at: photoInfo.photo_moderated_at,
            }
          : {}),
      }),
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setRecipeMessage(payload.message ?? "Failed to create recipe.");
      setRecipeLoading(false);
      return;
    }

    setRecipeMessage("Recipe created successfully.");
    setRecipeLoading(false);
    setRecipeForm(createEmptyRecipeForm());
    setPhotoInfo(null);
    setPhotoError(null);
    setPhotoModerationReason(null);
  };


  const handlePhotoSelect = async (file: File) => {
    setPhotoUploading(true);
    setPhotoError(null);
    setPhotoModerationReason(null);

    const formData = new FormData();
    formData.append("file", file);

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

    setPhotoInfo({
      photo_url: payload.photo_url,
      photo_path: payload.photo_path,
      photo_width: payload.photo_width ?? null,
      photo_height: payload.photo_height ?? null,
      photo_size_bytes: payload.photo_size_bytes ?? file.size,
      photo_moderation_status: payload.photo_moderation_status ?? null,
      photo_moderated_at: payload.photo_moderated_at ?? null,
    });
    setPhotoModerationReason(payload.moderation?.reason ?? null);
    setPhotoUploading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            Nutra Admin
          </p>
          <h1 className="text-4xl font-semibold">Admin Console</h1>
          <p className="max-w-2xl text-zinc-300">
            Sign in with your Supabase admin credentials to create new recipes.
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

            <section className="grid gap-6 lg:grid-cols-[1.2fr]">
              <form
                onSubmit={handleCreateRecipe}
                className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8"
              >
                <h2 className="text-2xl font-semibold text-white">Create Recipe</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Add a new recipe to the Supabase recipes table.
                </p>
                {recipeMessage && (
                  <p className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    {recipeMessage}
                  </p>
                )}
                <RecipeFormTabs
                  value={recipeForm}
                  onChange={setRecipeForm}
                  errors={recipeErrors}
                  photoUpload={{
                    photoUrl: photoInfo?.photo_url ?? null,
                    photoPath: photoInfo?.photo_path ?? null,
                    photoWidth: photoInfo?.photo_width ?? null,
                    photoHeight: photoInfo?.photo_height ?? null,
                    photoSizeBytes: photoInfo?.photo_size_bytes ?? null,
                    moderationStatus: photoInfo?.photo_moderation_status ?? null,
                    moderationReason: photoModerationReason,
                    uploading: photoUploading,
                    error: photoError,
                    onSelectFile: handlePhotoSelect,
                  }}
                />
                <button
                  type="submit"
                  disabled={recipeLoading}
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/40"
                >
                  {recipeLoading ? "Saving..." : "Create Recipe"}
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
