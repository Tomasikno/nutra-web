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
    <div className="soft-card rounded-2xl p-6">
      <h2 className="display-type mb-4 text-3xl font-bold text-forest-green">{title}</h2>
      <ul className="space-y-3">
        {ingredients.map((ingredient, index) => (
          <li
            key={`${ingredient.name}-${index}`}
            className="rounded-full border border-forest-green/12 bg-cream-beige/50 px-5 py-3 text-lg text-forest-green"
          >
            {ingredient.amount && <span className="font-semibold">{ingredient.amount} </span>}
            {ingredient.unit && <span>{ingredient.unit} </span>}
            {ingredient.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
