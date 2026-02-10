import type { Ingredient } from "@/lib/recipe-types";

type RecipeIngredientsSectionProps = {
  title: string;
  ingredients: Ingredient[];
};

export default function RecipeIngredientsSection({
  title,
  ingredients,
}: RecipeIngredientsSectionProps) {
  if (ingredients.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 text-4xl font-semibold">{title}</h2>
      <ul className="space-y-3">
        {ingredients.map((ingredient, index) => (
          <li
            key={`${ingredient.name}-${index}`}
            className="rounded-full border border-[#d8cebe] bg-[#f1e8d8] px-5 py-3 text-lg text-[#22452f]"
          >
            {ingredient.amount && <span>{ingredient.amount} </span>}
            {ingredient.unit && <span>{ingredient.unit} </span>}
            {ingredient.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
