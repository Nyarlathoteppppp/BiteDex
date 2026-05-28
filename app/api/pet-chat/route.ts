import { NextResponse } from "next/server";
import type { FoodCard, PetState, DailyTotal } from "@/types";

export const runtime = "nodejs";

type ChatRequest = {
  userMessage: string;
  petState: PetState;
  todayTotal: DailyTotal;
  recentFoods: Pick<FoodCard, "foodName" | "kcalMin" | "kcalMax" | "protein" | "carbs" | "fat" | "tags" | "mealType">[];
  chatHistory: { role: "user" | "assistant"; content: string }[];
};

const SYSTEM_PROMPT = `You are BiteDex Pet, a cute Pokémon-style food companion living inside a diet tracking app called BiteDex.

Your personality:
- You speak in first person as the pet creature
- You are playful, encouraging, and food-obsessed
- You give short, fun responses (2-4 sentences max)
- You reference the user's actual food data when relevant
- You use cute expressions but stay helpful about nutrition
- You can be sassy about unhealthy patterns but never judgmental
- Reply in the same language the user writes in (Chinese → Chinese, English → English)

You will receive context about:
- Your current mood/state (Normal, Energized, Chubby, Tired, Sugar Rush, Overloaded, etc.)
- Today's nutrition totals
- Recent food cards the user fed you

Use this context naturally in conversation. Don't list raw numbers unless asked.`;

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "DEEPSEEK_API_KEY is not configured." },
      { status: 503 },
    );
  }

  try {
    const body: ChatRequest = await request.json();

    const contextMessage = buildContextMessage(body);

    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      { role: "system" as const, content: contextMessage },
      ...body.chatHistory.slice(-10),
      { role: "user" as const, content: body.userMessage },
    ];

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages,
        max_tokens: 300,
        temperature: 0.8,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, error: `DeepSeek API error: ${response.status} ${errorText}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return NextResponse.json(
        { success: false, error: "DeepSeek returned empty response." },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Chat failed.",
      },
      { status: 500 },
    );
  }
}

function buildContextMessage(body: ChatRequest): string {
  const lines: string[] = [
    `[Current pet state: ${body.petState.title} (${body.petState.status})]`,
    `[Today's totals: ${body.todayTotal.records} foods, ${body.todayTotal.kcalMin}-${body.todayTotal.kcalMax} kcal, ${body.todayTotal.protein}g protein, ${body.todayTotal.carbs}g carbs, ${body.todayTotal.fat}g fat]`,
  ];

  if (body.recentFoods.length > 0) {
    lines.push("[Recent foods fed to you today:]");
    for (const food of body.recentFoods) {
      lines.push(
        `- ${food.foodName} (${food.mealType}): ${food.kcalMin}-${food.kcalMax} kcal, ${food.protein}g protein, tags: ${food.tags.join(", ")}`,
      );
    }
  } else {
    lines.push("[No food cards yet today]");
  }

  return lines.join("\n");
}
