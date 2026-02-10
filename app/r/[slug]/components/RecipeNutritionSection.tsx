type NutritionItem = {
  label: string;
  value: string;
};

type RecipeNutritionSectionProps = {
  portionLabel: string;
  perLabel: string;
  items: NutritionItem[];
};

export default function RecipeNutritionSection({
  portionLabel,
  perLabel,
  items,
}: RecipeNutritionSectionProps) {
  return (
    <section className="relative rounded-[28px] bg-[#2e5a3b] px-3 pb-6 pt-7 text-white shadow-[0_10px_30px_rgba(46,90,59,0.35)] md:px-6">
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-[#d4c9b5] bg-[#EBE1D1] px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2e5a3b]">
        {perLabel} {portionLabel}
      </span>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-0">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={`flex flex-col items-center justify-center py-3 ${
              index > 0 ? "md:border-l md:border-white/15" : ""
            }`}
          >
            <span className="text-4xl font-semibold leading-none sm:text-[2.7rem] md:text-5xl">
              {item.value}
            </span>
            <span className="mt-2 text-xs uppercase tracking-[0.2em] text-white/80">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
