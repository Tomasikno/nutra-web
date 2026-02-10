"use client";

import type { NutritionInfo } from "@/lib/recipe-types";

type NutritionInputsProps = {
  nutrition: NutritionInfo;
  onChange: (nutrition: NutritionInfo) => void;
  error?: string | null;
};

const fields: Array<{ key: keyof NutritionInfo; label: string }> = [
  { key: "calories", label: "Calories" },
  { key: "protein", label: "Protein" },
  { key: "carbs", label: "Carbs" },
  { key: "fat", label: "Fat" },
  { key: "fiber", label: "Fiber" },
  { key: "sugar", label: "Sugar" },
];

export default function NutritionInputs({ nutrition, onChange, error }: NutritionInputsProps) {
  const updateField = (key: keyof NutritionInfo, value: number) => {
    onChange({ ...nutrition, [key]: value });
  };

  return (
    <div className="grid gap-4">
      <p className="text-sm font-semibold text-white">Nutrition</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className="flex flex-col gap-2 text-sm">
            {field.label}
            <input
              type="number"
              min={0}
              value={nutrition[field.key]}
              onChange={(event) =>
                updateField(field.key, Number(event.target.value || 0))
              }
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
            />
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-rose-200">{error}</p>}
    </div>
  );
}
