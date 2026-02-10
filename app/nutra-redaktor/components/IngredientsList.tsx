"use client";

import type { Ingredient } from "@/lib/recipe-types";

type IngredientsListProps = {
  ingredients: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
  error?: string | null;
};

const createIngredient = (): Ingredient => ({ name: "", amount: "", unit: "" });

export default function IngredientsList({ ingredients, onChange, error }: IngredientsListProps) {
  const updateIngredient = (index: number, key: keyof Ingredient, value: string) => {
    const next = ingredients.map((item, idx) =>
      idx === index ? { ...item, [key]: value } : item
    );
    onChange(next);
  };

  const addIngredient = () => {
    onChange([...ingredients, createIngredient()]);
  };

  const removeIngredient = (index: number) => {
    onChange(ingredients.filter((_, idx) => idx !== index));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Ingredients</p>
        <button
          type="button"
          onClick={addIngredient}
          className="rounded-full border border-emerald-400/60 px-3 py-1 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300 hover:text-white"
        >
          Add Ingredient
        </button>
      </div>
      {ingredients.length === 0 && (
        <p className="text-xs text-zinc-500">No ingredients yet. Add at least one.</p>
      )}
      {ingredients.map((ingredient, index) => (
        <div
          key={`${ingredient.name}-${index}`}
          className="grid gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 sm:grid-cols-[2fr_1fr_1fr_auto]"
        >
          <input
            type="text"
            placeholder="Name"
            value={ingredient.name}
            onChange={(event) => updateIngredient(index, "name", event.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Amount"
            value={ingredient.amount ?? ""}
            onChange={(event) => updateIngredient(index, "amount", event.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Unit"
            value={ingredient.unit ?? ""}
            onChange={(event) => updateIngredient(index, "unit", event.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => removeIngredient(index)}
            className="rounded-full border border-rose-400/50 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:border-rose-300 hover:text-white"
          >
            Remove
          </button>
        </div>
      ))}
      {error && <p className="text-xs text-rose-200">{error}</p>}
    </div>
  );
}
