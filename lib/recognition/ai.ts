import type { MealType, RecognizedFood } from "@/types";
import { recognizedFoodSchema } from "@/lib/recognition/schema";

type AIResponsesPayload = {
  model: string;
  input: Array<{
    role: "user";
    content: Array<
      | {
          type: "input_image";
          image_url: string;
        }
      | {
          type: "input_text";
          text: string;
        }
    >;
  }>;
};

export async function recognizeFoodWithAI({
  apiKey,
  imageBase64,
  mimeType,
  mealType,
  description,
  model = "doubao-seed-2-0-lite-260428",
}: {
  apiKey: string;
  imageBase64: string;
  mimeType: string;
  mealType: MealType;
  description?: string;
  model?: string;
}): Promise<RecognizedFood> {
  const payload: AIResponsesPayload = {
    model,
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_image",
            image_url: `data:${mimeType};base64,${imageBase64}`,
          },
          {
            type: "input_text",
            text: buildRecognitionPrompt(mealType, description),
          },
        ],
      },
    ],
  };

  const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const responseText = await response.text();
  const responseJson = parseJson(responseText);

  if (!response.ok) {
    throw new Error(extractAIErrorMessage(responseJson) ?? responseText);
  }

  const rawText = extractResponseText(responseJson);

  if (!rawText) {
    throw new Error("AI returned an empty response.");
  }

  const parsed = recognizedFoodSchema.parse(parseModelJson(rawText));

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
    "Analyze the food image and estimate nutrition from the visible portion.",
    "Return ONLY one valid JSON object. Do not wrap it in Markdown.",
    "The JSON object must have exactly these fields:",
    "foodName, portion, estimatedMealType, kcalMin, kcalMax, protein, carbs, fat, tags, confidence, biteScore, advice.",
    `The user-selected meal type is ${mealType}; prefer it unless the image is clearly a drink or snack.`,
    description
      ? `User food/portion description: ${description}. Use it as helpful context, but do not invent implausible ingredients.`
      : "The user did not provide extra food description.",
    "Use calorie ranges, not precise calories.",
    "Nutrition numbers must be integers. confidence must be 0 to 1. biteScore must be 0 to 100.",
    "estimatedMealType must be one of: breakfast, lunch, dinner, snack, drink, other.",
    "tags must be 1 to 6 items from: high_sugar, high_fat, high_carb, high_protein, sweet, dessert, drink, snack, fried, creamy, fast_food, balanced, low_calorie, high_calorie.",
    "If no food is visible, return foodName as No food detected, portion as N/A, all nutrition values as 0, tags as [low_calorie], confidence as 0, biteScore as 0.",
    "Do not include medical claims.",
  ].join("\n");
}

function extractResponseText(value: any): string | undefined {
  if (typeof value?.output_text === "string") {
    return value.output_text;
  }

  if (Array.isArray(value?.output)) {
    for (const item of value.output) {
      if (typeof item?.content === "string") {
        return item.content;
      }

      if (Array.isArray(item?.content)) {
        for (const content of item.content) {
          if (typeof content?.text === "string") {
            return content.text;
          }
        }
      }
    }
  }

  const choiceContent = value?.choices?.[0]?.message?.content;

  if (typeof choiceContent === "string") {
    return choiceContent;
  }

  return undefined;
}

function parseModelJson(value: string): unknown {
  const cleaned = value
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI did not return JSON.");
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}

function parseJson(value: string): any {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractAIErrorMessage(value: any): string | undefined {
  const message = value?.error?.message ?? value?.message ?? value?.error;
  return typeof message === "string" ? message : undefined;
}

