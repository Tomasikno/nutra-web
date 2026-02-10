"use client";

import type { HealthBenefit } from "@/lib/recipe-types";

type HealthBenefitsListProps = {
  benefits: HealthBenefit[];
  onChange: (benefits: HealthBenefit[]) => void;
  error?: string | null;
};

const createBenefit = (): HealthBenefit => ({ benefit: "", description: "" });

export default function HealthBenefitsList({ benefits, onChange, error }: HealthBenefitsListProps) {
  const updateBenefit = (index: number, key: keyof HealthBenefit, value: string) => {
    const next = benefits.map((item, idx) =>
      idx === index ? { ...item, [key]: value } : item
    );
    onChange(next);
  };

  const addBenefit = () => {
    onChange([...benefits, createBenefit()]);
  };

  const removeBenefit = (index: number) => {
    onChange(benefits.filter((_, idx) => idx !== index));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Health Benefits</p>
        <button
          type="button"
          onClick={addBenefit}
          className="rounded-full border border-emerald-400/60 px-3 py-1 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300 hover:text-white"
        >
          Add Benefit
        </button>
      </div>
      {benefits.length === 0 && (
        <p className="text-xs text-zinc-500">No benefits added.</p>
      )}
      {benefits.map((benefit, index) => (
        <div
          key={`${benefit.benefit}-${index}`}
          className="grid gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 sm:grid-cols-[1fr_2fr_auto]"
        >
          <input
            type="text"
            placeholder="Benefit"
            value={benefit.benefit}
            onChange={(event) => updateBenefit(index, "benefit", event.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Description"
            value={benefit.description ?? ""}
            onChange={(event) => updateBenefit(index, "description", event.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => removeBenefit(index)}
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
