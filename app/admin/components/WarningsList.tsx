"use client";

import type { Warning } from "@/lib/recipe-types";

type WarningsListProps = {
  warnings: Warning[];
  onChange: (warnings: Warning[]) => void;
  error?: string | null;
};

const createWarning = (): Warning => ({ type: "", message: "" });

export default function WarningsList({ warnings, onChange, error }: WarningsListProps) {
  const updateWarning = (index: number, key: keyof Warning, value: string) => {
    const next = warnings.map((item, idx) =>
      idx === index ? { ...item, [key]: value } : item
    );
    onChange(next);
  };

  const addWarning = () => {
    onChange([...warnings, createWarning()]);
  };

  const removeWarning = (index: number) => {
    onChange(warnings.filter((_, idx) => idx !== index));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Warnings</p>
        <button
          type="button"
          onClick={addWarning}
          className="rounded-full border border-emerald-400/60 px-3 py-1 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300 hover:text-white"
        >
          Add Warning
        </button>
      </div>
      {warnings.length === 0 && (
        <p className="text-xs text-zinc-500">No warnings added.</p>
      )}
      {warnings.map((warning, index) => (
        <div
          key={`${warning.type}-${index}`}
          className="grid gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 sm:grid-cols-[1fr_2fr_auto]"
        >
          <input
            type="text"
            placeholder="Type"
            value={warning.type}
            onChange={(event) => updateWarning(index, "type", event.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Message"
            value={warning.message}
            onChange={(event) => updateWarning(index, "message", event.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => removeWarning(index)}
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
