"use client";

type StepsListProps = {
  steps: string[];
  onChange: (steps: string[]) => void;
  error?: string | null;
};

export default function StepsList({ steps, onChange, error }: StepsListProps) {
  const addStep = () => {
    onChange([...steps, ""]);
  };

  const updateStep = (index: number, value: string) => {
    const next = steps.map((step, idx) => (idx === index ? value : step));
    onChange(next);
  };

  const removeStep = (index: number) => {
    onChange(steps.filter((_, idx) => idx !== index));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Steps</p>
        <button
          type="button"
          onClick={addStep}
          className="rounded-full border border-emerald-400/60 px-3 py-1 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300 hover:text-white"
        >
          Add Step
        </button>
      </div>
      {steps.length === 0 && (
        <p className="text-xs text-zinc-500">No steps yet. Add at least one.</p>
      )}
      {steps.map((step, index) => (
        <div key={`step-${index}`} className="flex items-start gap-3">
          <div className="mt-3 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 text-xs text-zinc-300">
            {index + 1}
          </div>
          <textarea
            value={step}
            onChange={(event) => updateStep(index, event.target.value)}
            placeholder="Describe this step"
            className="min-h-[70px] flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => removeStep(index)}
            className="mt-2 rounded-full border border-rose-400/50 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:border-rose-300 hover:text-white"
          >
            Remove
          </button>
        </div>
      ))}
      {error && <p className="text-xs text-rose-200">{error}</p>}
    </div>
  );
}
