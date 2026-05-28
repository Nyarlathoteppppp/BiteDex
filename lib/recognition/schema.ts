import { z } from "zod";
import { foodTags, mealTypes } from "@/types";

export const recognizedFoodSchema = z.object({
  foodName: z.string().min(1),
  portion: z.string().min(1),
  estimatedMealType: z.enum(mealTypes),
  kcalMin: z.number().int().nonnegative(),
  kcalMax: z.number().int().nonnegative(),
  protein: z.number().int().nonnegative(),
  carbs: z.number().int().nonnegative(),
  fat: z.number().int().nonnegative(),
  tags: z.array(z.enum(foodTags)).min(1).max(6),
  confidence: z.number().min(0).max(1),
  biteScore: z.number().int().min(0).max(100),
  advice: z.string().min(1),
});
