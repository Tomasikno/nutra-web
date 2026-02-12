"use client";

import { useMemo, useState } from "react";
import type { Recipe, RecipeFormData, RecipeShareVisibility } from "@/lib/recipe-types";
import Image from "next/image";
import IngredientsList from "./IngredientsList";
import StepsList from "./StepsList";
import NutritionInputs from "./NutritionInputs";
import HealthBenefitsList from "./HealthBenefitsList";
import WarningsList from "./WarningsList";
import TagInput from "./TagInput";

type RecipeFormTabsProps = {
  value: RecipeFormData;
  onChange: (value: RecipeFormData) => void;
  errors?: Record<string, string>;
  metadata?: Recipe | null;
  photoUpload?: {
    photoUrl?: string | null;
    photoPath?: string | null;
    photoWidth?: number | null;
    photoHeight?: number | null;
    photoSizeBytes?: number | null;
    moderationStatus?: string | null;
    moderationReason?: string | null;
    uploading?: boolean;
    error?: string | null;
    onSelectFile?: (file: File) => void;
  };
};

type TabKey = "basic" | "timing" | "content" | "nutrition" | "categorization" | "metadata";

const tabLabels: Record<TabKey, string> = {
  basic: "Basic Info",
  timing: "Timing & Difficulty",
  content: "Ingredients & Steps",
  nutrition: "Nutrition & Health",
  categorization: "Categorization",
  metadata: "Photo & Metadata",
};

export default function RecipeFormTabs({
  value,
  onChange,
  errors,
  metadata,
  photoUpload,
}: RecipeFormTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("basic");

  const updateField = <K extends keyof RecipeFormData>(key: K, nextValue: RecipeFormData[K]) => {
    onChange({ ...value, [key]: nextValue });
  };

  const hasMetadata = Boolean(metadata);

  const nutritionError = errors?.nutrition ?? null;

  const fieldErrors = useMemo(() => errors ?? {}, [errors]);

  const photoUrl = photoUpload?.photoUrl ?? metadata?.photo_url ?? null;
  const photoPath = photoUpload?.photoPath ?? metadata?.photo_path ?? null;
  const photoWidth = photoUpload?.photoWidth ?? metadata?.photo_width ?? null;
  const photoHeight = photoUpload?.photoHeight ?? metadata?.photo_height ?? null;
  const photoSizeBytes = photoUpload?.photoSizeBytes ?? metadata?.photo_size_bytes ?? null;
  const moderationStatus =
    photoUpload?.moderationStatus ?? metadata?.photo_moderation_status ?? null;
  const moderationReason = photoUpload?.moderationReason ?? null;

  return (
    <div className="mt-6 flex flex-col gap-6">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {(Object.keys(tabLabels) as TabKey[]).map((tabKey, index) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setActiveTab(tabKey)}
            className={`rounded-2xl border px-4 py-3 text-left text-xs font-semibold transition ${
              activeTab === tabKey
                ? "border-emerald-400 bg-emerald-500/10 text-emerald-100"
                : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-emerald-400/60 hover:text-emerald-200"
            }`}
          >
            <span className="block text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Station {String(index + 1).padStart(2, "0")}
            </span>
            <span className="mt-1 block text-xs">{tabLabels[tabKey]}</span>
          </button>
        ))}
      </div>

      {activeTab === "basic" && (
        <div className="grid gap-4">
          <label className="flex flex-col gap-2 text-sm">
            Recipe Name
            <input
              type="text"
              value={value.recipe_name}
              onChange={(event) => updateField("recipe_name", event.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
            />
            {fieldErrors.recipe_name && (
              <span className="text-xs text-rose-200">{fieldErrors.recipe_name}</span>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Description
            <textarea
              value={value.description}
              onChange={(event) => updateField("description", event.target.value)}
              className="min-h-[120px] rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
            />
            {fieldErrors.description && (
              <span className="text-xs text-rose-200">{fieldErrors.description}</span>
            )}
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm">
              Servings
              <input
                type="number"
                min={1}
                value={value.servings}
                onChange={(event) => updateField("servings", Number(event.target.value || 1))}
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
              {fieldErrors.servings && (
                <span className="text-xs text-rose-200">{fieldErrors.servings}</span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Language
              <select
                value={value.language ?? ""}
                onChange={(event) =>
                  updateField(
                    "language",
                    event.target.value
                      ? (event.target.value as RecipeFormData["language"])
                      : null
                  )
                }
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
              >
                <option value="">Unspecified</option>
                <option value="en">English (en)</option>
                <option value="cs">Czech (cs)</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Visibility
              <select
                value={value.share_visibility}
                onChange={(event) => updateField("share_visibility", event.target.value as RecipeShareVisibility)}
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
              >
                <option value="PRIVATE">Private</option>
                <option value="UNLISTED">Unlisted</option>
                <option value="PUBLIC">Public</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {activeTab === "timing" && (
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm">
              Prep Time (min)
              <input
                type="number"
                min={0}
                value={value.prep_time_minutes}
                onChange={(event) =>
                  updateField("prep_time_minutes", Number(event.target.value || 0))
                }
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
              {fieldErrors.prep_time_minutes && (
                <span className="text-xs text-rose-200">{fieldErrors.prep_time_minutes}</span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Cook Time (min)
              <input
                type="number"
                min={0}
                value={value.cook_time_minutes}
                onChange={(event) =>
                  updateField("cook_time_minutes", Number(event.target.value || 0))
                }
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
              {fieldErrors.cook_time_minutes && (
                <span className="text-xs text-rose-200">{fieldErrors.cook_time_minutes}</span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Difficulty
              <select
                value={value.difficulty}
                onChange={(event) => updateField("difficulty", event.target.value as RecipeFormData["difficulty"])}
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
              {fieldErrors.difficulty && (
                <span className="text-xs text-rose-200">{fieldErrors.difficulty}</span>
              )}
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              Time of Day
              <select
                value={value.time_of_day ?? ""}
                onChange={(event) =>
                  updateField(
                    "time_of_day",
                    event.target.value ? (event.target.value as RecipeFormData["time_of_day"]) : null
                  )
                }
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
              >
                <option value="">Unspecified</option>
                <option value="BREAKFAST">Breakfast</option>
                <option value="LUNCH">Lunch</option>
                <option value="DINNER">Dinner</option>
                <option value="SNACK">Snack</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {activeTab === "content" && (
        <div className="grid gap-6">
          <IngredientsList
            ingredients={value.ingredients}
            onChange={(next) => updateField("ingredients", next)}
            error={fieldErrors.ingredients}
          />
          <StepsList
            steps={value.steps}
            onChange={(next) => updateField("steps", next)}
            error={fieldErrors.steps}
          />
        </div>
      )}

      {activeTab === "nutrition" && (
        <div className="grid gap-6">
          <NutritionInputs
            nutrition={value.nutrition}
            onChange={(next) => updateField("nutrition", next)}
            error={nutritionError}
          />
          <label className="flex flex-col gap-2 text-sm">
            Health Score (0-100)
            <input
              type="number"
              min={0}
              max={100}
              value={value.health_score}
              onChange={(event) => updateField("health_score", Number(event.target.value || 0))}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
            />
            {fieldErrors.health_score && (
              <span className="text-xs text-rose-200">{fieldErrors.health_score}</span>
            )}
          </label>
          <HealthBenefitsList
            benefits={value.health_benefits}
            onChange={(next) => updateField("health_benefits", next)}
            error={fieldErrors.health_benefits}
          />
          <WarningsList
            warnings={value.warnings}
            onChange={(next) => updateField("warnings", next)}
            error={fieldErrors.warnings}
          />
        </div>
      )}

      {activeTab === "categorization" && (
        <div className="grid gap-6">
          <TagInput
            label="Dietary Tags"
            value={value.dietary_tags}
            onChange={(next) => updateField("dietary_tags", next)}
            placeholder="Add tag and press Enter"
            helperText="Examples: keto, gluten-free, vegan"
            error={fieldErrors.dietary_tags}
          />
          <TagInput
            label="Meal Categories"
            value={value.meal_categories}
            onChange={(next) => updateField("meal_categories", next)}
            placeholder="Add category and press Enter"
            helperText="Examples: lunch, quick, meal-prep"
            error={fieldErrors.meal_categories}
          />
          <label className="flex flex-col gap-2 text-sm">
            Portion Size
            <input
              type="text"
              value={value.portion_size ?? ""}
              onChange={(event) => updateField("portion_size", event.target.value || null)}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
              placeholder="e.g. 250g or 1 bowl"
            />
          </label>
        </div>
      )}

      {activeTab === "metadata" && (
        <div className="grid gap-4 text-sm text-zinc-200">
          <div className="grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Recipe Photo</p>
                <p className="text-xs text-zinc-500">
                  Upload a recipe image (JPG, PNG, or WebP, max 10 MB).
                </p>
              </div>
              {photoUpload?.uploading && (
                <p className="text-xs text-emerald-200">Uploading...</p>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file && photoUpload?.onSelectFile) {
                  photoUpload.onSelectFile(file);
                }
              }}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-emerald-400"
            />
            {photoUpload?.error && (
              <p className="text-xs text-rose-200">{photoUpload.error}</p>
            )}
            {photoUrl && (
              <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                <div className="h-[120px] w-[120px] overflow-hidden rounded-2xl border border-zinc-800">
                  <Image
                    src={photoUrl}
                    alt="Recipe preview"
                    width={120}
                    height={120}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="grid gap-2 text-xs text-zinc-300">
                  <p className="break-all">
                    <span className="text-zinc-500">URL:</span> {photoUrl}
                  </p>
                  {photoPath && (
                    <p className="break-all">
                      <span className="text-zinc-500">Path:</span> {photoPath}
                    </p>
                  )}
                  <p>
                    <span className="text-zinc-500">Size:</span>{" "}
                    {photoSizeBytes ? `${photoSizeBytes} bytes` : "N/A"}
                  </p>
                  <p>
                    <span className="text-zinc-500">Dimensions:</span>{" "}
                    {photoWidth && photoHeight ? `${photoWidth} x ${photoHeight}` : "N/A"}
                  </p>
                  {moderationStatus && (
                    <p>
                      <span className="text-zinc-500">Moderation:</span>{" "}
                      {moderationStatus}
                    </p>
                  )}
                  {moderationReason && (
                    <p>
                      <span className="text-zinc-500">Reason:</span> {moderationReason}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          {!hasMetadata && (
            <p className="text-zinc-500">Metadata will appear after the recipe is saved.</p>
          )}
          {hasMetadata && metadata && (
            <div className="grid gap-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-zinc-500">Recipe ID</p>
                  <p className="text-white">{metadata.id}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-zinc-500">Created By</p>
                  <p className="text-white">{metadata.created_by}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-zinc-500">Created At</p>
                  <p className="text-white">{metadata.created_at}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-zinc-500">Updated At</p>
                  <p className="text-white">{metadata.updated_at}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-zinc-500">Deleted At</p>
                  <p className="text-white">{metadata.deleted_at ?? "Not deleted"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-zinc-500">Embedding</p>
                  <p className="text-white">{metadata.embedding ? "Available" : "Not generated"}</p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-zinc-500">Photo URL</p>
                  <p className="text-white break-all">{metadata.photo_url ?? "None"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-zinc-500">Photo Path</p>
                  <p className="text-white break-all">{metadata.photo_path ?? "None"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-zinc-500">Photo Width</p>
                  <p className="text-white">{metadata.photo_width ?? "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-zinc-500">Photo Height</p>
                  <p className="text-white">{metadata.photo_height ?? "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-zinc-500">Photo Size</p>
                  <p className="text-white">
                    {metadata.photo_size_bytes ? `${metadata.photo_size_bytes} bytes` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-zinc-500">Moderation Status</p>
                  <p className="text-white">{metadata.photo_moderation_status ?? "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-zinc-500">Moderated At</p>
                  <p className="text-white">{metadata.photo_moderated_at ?? "N/A"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
