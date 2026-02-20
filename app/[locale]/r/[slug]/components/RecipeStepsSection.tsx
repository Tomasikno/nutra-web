type RecipeStepsSectionProps = {
  title: string;
  steps: string[];
};

export default function RecipeStepsSection({ title, steps }: RecipeStepsSectionProps) {
  if (steps.length === 0) return null;

  return (
    <div className="soft-card rounded-2xl p-6">
      <h2 className="display-type mb-4 text-3xl font-bold text-forest-green">{title}</h2>
      <ol className="space-y-6">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-4">
            <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-green text-sm font-semibold text-white">
              {index + 1}
            </span>
            <p className="pt-1 text-lg leading-relaxed text-forest-green/85">{step}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
