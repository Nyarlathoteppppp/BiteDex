import type { FoodCard, MealType, RecognizedFood } from "@/types";
import { computeRarity } from "@/lib/nutrition";
import { fallbackFoods } from "@/lib/mock/foods";
import { getLocalDateKey, getLocalTimeKey } from "@/lib/utils/dates";

export const sampleTodayFoods: FoodCard[] = [
  makeMockFoodCard(fallbackFoods[0], {
    id: "sample-rice-bowl",
    date: "2026-05-28",
    time: "12:30",
    mealType: "lunch",
    createdAt: "2026-05-28T12:30:00.000Z",
  }),
  makeMockFoodCard(fallbackFoods[2], {
    id: "sample-milk-tea",
    date: "2026-05-28",
    time: "15:20",
    mealType: "drink",
    createdAt: "2026-05-28T15:20:00.000Z",
  }),
  makeMockFoodCard(fallbackFoods[4], {
    id: "sample-cake",
    date: "2026-05-28",
    time: "16:10",
    mealType: "snack",
    createdAt: "2026-05-28T16:10:00.000Z",
  }),
];

export function makeMockFoodCard(
  food: RecognizedFood,
  options: {
    id?: string;
    date?: string;
    time?: string;
    mealType?: MealType;
    imageUrl?: string;
    createdAt?: string;
  } = {},
): FoodCard {
  const now = new Date();
  const createdAt = options.createdAt ?? now.toISOString();

  return {
    ...food,
    id: options.id ?? crypto.randomUUID(),
    date: options.date ?? getLocalDateKey(now),
    time: options.time ?? getLocalTimeKey(now),
    mealType: options.mealType ?? food.estimatedMealType,
    imageUrl: options.imageUrl ?? "/samples/food-placeholder.png",
    rarity: computeRarity(food),
    createdAt,
  };
}
