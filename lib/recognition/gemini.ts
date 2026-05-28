import { createPartFromBase64, createPartFromText, GoogleGenAI } from "@google/genai";
import type { MealType, RecognizedFood } from "@/types";
import {
  geminiRecognizedFoodSchema,
  recognizedFoodSchema,
} from "@/lib/recognition/schema";

export async function recognizeFoodWithGemini({
  apiKey,
  imageBase64,
  mimeType,
  mealType,
  description,
}: {
  apiKey: string;
  imageBase64: string;
  mimeType: string;
  mealType: MealType;
  description?: string;
}): Promise<RecognizedFood> {
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          createPartFromText(buildRecognitionPrompt(mealType, description)),
          createPartFromBase64(imageBase64, mimeType),
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: geminiRecognizedFoodSchema,
    },
  });

  const rawText = response.text;

  if (!rawText) {
    throw new Error("Gemini returned an empty response.");
  }

  const parsed = recognizedFoodSchema.parse(JSON.parse(rawText));

  if (parsed.kcalMax < parsed.kcalMin) {
    return {
      ...parsed,
      kcalMin: parsed.kcalMax,
      kcalMax: parsed.kcalMin,
    };
  }

  return parsed;
}

function buildRecognitionPrompt(mealType: MealType, description?: string): string {
  return [
    "You are BiteDex food recognition.",
    "Analyze the food image and estimate nutrition from visible food only.",
    "Return one JSON object that matches the schema exactly.",
    `The user-selected meal type is ${mealType}; prefer it unless the image is clearly a drink or snack.`,
    description
      ? `The user also described the food/portion as: ${description}. Use this as helpful context, but do not invent ingredients that are not plausible from the image.`
      : "The user did not provide extra food description.",
    "Use calorie ranges, not precise calories.",
    "Estimate protein, carbs, and fat in grams for the visible portion.",
    "Use only these tags: high_sugar, high_fat, high_carb, high_protein, sweet, dessert, drink, snack, fried, creamy, fast_food, balanced, low_calorie, high_calorie.",
    "Do not include medical claims.",
  ].join("\n");
}
