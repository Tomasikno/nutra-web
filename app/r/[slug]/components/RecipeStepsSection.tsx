type RecipeStepsSectionProps = {
  title: string;
  steps: string[];
};

export default function RecipeStepsSection({ title, steps }: RecipeStepsSectionProps) {
  if (steps.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 text-4xl font-semibold">{title}</h2>
      <ol className="space-y-6">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-4">
            <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2e5a3b] text-sm font-semibold text-white">
              {index + 1}
            </span>
            <p className="pt-1 text-lg leading-relaxed text-[#2d4e3a]">{step}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
