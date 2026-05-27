import { Type } from "@google/genai";
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

export const geminiRecognizedFoodSchema = {
  type: Type.OBJECT,
  required: [
    "foodName",
    "portion",
    "estimatedMealType",
    "kcalMin",
    "kcalMax",
    "protein",
    "carbs",
    "fat",
    "tags",
    "confidence",
    "biteScore",
    "advice",
  ],
  properties: {
    foodName: {
      type: Type.STRING,
      description: "Short food name in English, such as Chocolate Cake.",
    },
    portion: {
      type: Type.STRING,
      description: "Estimated visible portion, such as 1 slice or 1 bowl.",
    },
    estimatedMealType: {
      type: Type.STRING,
      format: "enum",
      enum: [...mealTypes],
    },
    kcalMin: {
      type: Type.INTEGER,
      minimum: 0,
      description: "Lower bound of estimated calories.",
    },
    kcalMax: {
      type: Type.INTEGER,
      minimum: 0,
      description: "Upper bound of estimated calories. Must be >= kcalMin.",
    },
    protein: {
      type: Type.INTEGER,
      minimum: 0,
      description: "Estimated protein in grams.",
    },
    carbs: {
      type: Type.INTEGER,
      minimum: 0,
      description: "Estimated carbohydrates in grams.",
    },
    fat: {
      type: Type.INTEGER,
      minimum: 0,
      description: "Estimated fat in grams.",
    },
    tags: {
      type: Type.ARRAY,
      minItems: "1",
      maxItems: "6",
      items: {
        type: Type.STRING,
        format: "enum",
        enum: [...foodTags],
      },
    },
    confidence: {
      type: Type.NUMBER,
      minimum: 0,
      maximum: 1,
    },
    biteScore: {
      type: Type.INTEGER,
      minimum: 0,
      maximum: 100,
    },
    advice: {
      type: Type.STRING,
      description: "One concise nutrition suggestion.",
    },
  },
  propertyOrdering: [
    "foodName",
    "portion",
    "estimatedMealType",
    "kcalMin",
    "kcalMax",
    "protein",
    "carbs",
    "fat",
    "tags",
    "confidence",
    "biteScore",
    "advice",
  ],
};

