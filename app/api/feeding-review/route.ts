import { NextResponse } from "next/server";
import type { FoodCard, PetState, DailyTotal } from "@/types";

export const runtime = "nodejs";

type FeedingReviewRequest = {
  food: Pick<FoodCard, "foodName" | "kcalMin" | "kcalMax" | "protein" | "carbs" | "fat" | "tags" | "mealType" | "portion" | "biteScore">;
  petState: PetState;
  todayTotal: DailyTotal;
  previousFoods: string[];
  language?: "zh" | "en";
};

const SYSTEM_PROMPT = `You are a Food Pet living inside BiteDex, a food collection app. The user just fed you a new food card.

Your job: give a short, personality-rich reaction to the food you just received. You speak as the pet creature in first person.

Rules:
- 2-3 sentences max
- Be playful and food-obsessed
- Reference the specific food's nutrition naturally (don't just list numbers)
- React to the food's tags (sweet food → excited/hyper, fried → happy but guilty, healthy → proud)
- If the pet state is overloaded/chubby, sound stuffed; if tired, sound weak; if energized, sound happy
- Use the user's language: if the food name is Chinese, reply in Chinese; if English, reply in English
- No emojis unless the food name contains them
- Don't give medical advice
- Sound like a creature, not a nutritionist

Output format: return a JSON object with exactly these fields:
{
  "message": "your main reaction sentence",
  "reason": "one sentence explaining why you feel this way based on the food data",
  "suggestion": "one fun suggestion for the next meal"
}

Return ONLY valid JSON, no markdown.`;

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "DEEPSEEK_API_KEY is not configured." },
      { status: 503 },
    );
  }

  try {
    const body: FeedingReviewRequest = await request.json();

    const userContent = buildFeedingContext(body);

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        max_tokens: 200,
        temperature: 0.9,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, error: `DeepSeek error: ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    const rawReply = data.choices?.[0]?.message?.content?.trim();

    if (!rawReply) {
      return NextResponse.json(
        { success: false, error: "Empty response from DeepSeek." },
        { status: 502 },
      );
    }

    const cleaned = rawReply.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      success: true,
      data: {
        message: parsed.message || "Yum!",
        reason: parsed.reason || "",
        suggestion: parsed.suggestion || "",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Feeding review failed.",
      },
      { status: 500 },
    );
  }
}

function buildFeedingContext(body: FeedingReviewRequest): string {
  const { food, petState, todayTotal, previousFoods } = body;
  const languageInstruction =
    body.language === "zh"
      ? "Reply in Chinese."
      : body.language === "en"
        ? "Reply in English."
        : "Reply in the same language as the food name.";

  const lines = [
    `[New food card fed to me]`,
    `Food: ${food.foodName} (${food.portion})`,
    `Meal type: ${food.mealType}`,
    `Calories: ${food.kcalMin}-${food.kcalMax} kcal`,
    `Protein: ${food.protein}g, Carbs: ${food.carbs}g, Fat: ${food.fat}g`,
    `Tags: ${food.tags.join(", ")}`,
    `Bite score: ${food.biteScore}/100`,
    ``,
    `[My current state: ${petState.title} (${petState.status})]`,
    `[Today so far: ${todayTotal.records} foods, ${todayTotal.kcalMin}-${todayTotal.kcalMax} kcal total, ${todayTotal.protein}g protein]`,
    `[Language instruction: ${languageInstruction}]`,
  ];

  if (previousFoods.length > 0) {
    lines.push(`[Earlier today I also ate: ${previousFoods.join(", ")}]`);
  }

  return lines.join("\n");
}
