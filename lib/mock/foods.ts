import type { FoodTag, MealType, RecognizedFood } from "@/types";

export const fallbackFoods: RecognizedFood[] = [
  {
    foodName: "Rice Bowl",
    portion: "1 bowl",
    estimatedMealType: "lunch",
    kcalMin: 520,
    kcalMax: 720,
    protein: 24,
    carbs: 86,
    fat: 16,
    tags: ["high_carb", "balanced"],
    confidence: 0.72,
    biteScore: 68,
    advice: "A filling main meal. Add vegetables if the bowl looks light on fiber.",
  },
  {
    foodName: "Fried Chicken",
    portion: "2 pieces",
    estimatedMealType: "snack",
    kcalMin: 480,
    kcalMax: 760,
    protein: 32,
    carbs: 28,
    fat: 38,
    tags: ["fried", "high_fat", "fast_food"],
    confidence: 0.7,
    biteScore: 42,
    advice: "High in fat. Better balanced with water and vegetables.",
  },
  {
    foodName: "Milk Tea",
    portion: "1 cup",
    estimatedMealType: "drink",
    kcalMin: 320,
    kcalMax: 560,
    protein: 6,
    carbs: 68,
    fat: 14,
    tags: ["drink", "sweet", "high_sugar"],
    confidence: 0.74,
    biteScore: 35,
    advice: "A sweet drink can add calories quickly. Try less sugar next time.",
  },
  {
    foodName: "Salad",
    portion: "1 bowl",
    estimatedMealType: "lunch",
    kcalMin: 180,
    kcalMax: 360,
    protein: 14,
    carbs: 24,
    fat: 16,
    tags: ["low_calorie", "balanced"],
    confidence: 0.72,
    biteScore: 76,
    advice: "Light and balanced. Add lean protein if this is your main meal.",
  },
  {
    foodName: "Chocolate Cake",
    portion: "1 slice",
    estimatedMealType: "snack",
    kcalMin: 320,
    kcalMax: 460,
    protein: 5,
    carbs: 52,
    fat: 18,
    tags: ["dessert", "sweet", "high_sugar", "snack"],
    confidence: 0.78,
    biteScore: 38,
    advice: "High in sugar with low protein. Better treated as an occasional snack.",
  },
];

export function getFallbackFood(
  foodName: string,
  mealType: MealType = "other",
): RecognizedFood {
  const fallback = fallbackFoods.find(
    (food) => food.foodName.toLowerCase() === foodName.toLowerCase(),
  );

  if (!fallback) {
    return {
      foodName,
      portion: "1 serving",
      estimatedMealType: mealType,
      kcalMin: 300,
      kcalMax: 500,
      protein: 12,
      carbs: 48,
      fat: 16,
      tags: ["balanced"],
      confidence: 0.5,
      biteScore: 60,
      advice: "This is a general fallback estimate. Use it only when recognition fails.",
    };
  }

  return {
    ...fallback,
    estimatedMealType: mealType,
  };
}

export function makeMockRecognition(mealType: MealType = "snack"): RecognizedFood {
  const candidates = fallbackFoods.filter((food) =>
    mealType === "other" ? true : food.estimatedMealType === mealType,
  );
  const pool = candidates.length > 0 ? candidates : fallbackFoods;

  return {
    ...pool[Math.floor(Math.random() * pool.length)],
    estimatedMealType: mealType,
  };
}

export function normalizeTags(tags: string[]): FoodTag[] {
  const allowed = new Set<FoodTag>([
    "high_sugar",
    "high_fat",
    "high_carb",
    "high_protein",
    "sweet",
    "dessert",
    "drink",
    "snack",
    "fried",
    "creamy",
    "fast_food",
    "balanced",
    "low_calorie",
    "high_calorie",
  ]);

  return tags.filter((tag): tag is FoodTag => allowed.has(tag as FoodTag));
}
