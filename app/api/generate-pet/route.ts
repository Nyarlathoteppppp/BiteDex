import { NextResponse } from "next/server";
import { z } from "zod";
import { foodTags } from "@/types";
import type { GeneratedPet } from "@/types";
import {
  buildGeneratedPetProfile,
  buildPetImagePrompt,
} from "@/lib/pet-warehouse/profile";

export const runtime = "nodejs";

const petSourceFoodSchema = z.object({
  id: z.string(),
  foodName: z.string(),
  portion: z.string(),
  kcalMin: z.number(),
  kcalMax: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  tags: z.array(z.enum(foodTags)),
  rarity: z.enum(["N", "R", "SR", "SSR"]),
});

const generatePetRequestSchema = z.object({
  generationIndex: z.number().int().positive(),
  foods: z.array(petSourceFoodSchema).min(3).max(3),
});

export async function POST(request: Request) {
  const apiKey = process.env.ARK_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing ARK_API_KEY. Add it to .env.local and restart dev server.",
      },
      { status: 503 },
    );
  }

  try {
    const payload = generatePetRequestSchema.parse(await request.json());
    const profile = buildGeneratedPetProfile(payload.foods, payload.generationIndex);
    const prompt = buildPetImagePrompt(profile);

    const response = await fetch(
      "https://ark.cn-beijing.volces.com/api/v3/images/generations",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "doubao-seedream-5-0-260128",
          prompt,
          size: "2K",
          response_format: "url",
          watermark: true,
        }),
      },
    );

    const responseText = await response.text();
    const responseJson = parseJson(responseText);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: extractErrorMessage(responseJson) ?? "Doubao image generation failed.",
        },
        { status: response.status },
      );
    }

    const imageUrl = responseJson?.data?.[0]?.url;

    if (typeof imageUrl !== "string" || imageUrl.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Doubao response did not include an image URL.",
        },
        { status: 502 },
      );
    }

    const pet: GeneratedPet = {
      id: crypto.randomUUID(),
      generationIndex: payload.generationIndex,
      ...profile,
      imageUrl,
      createdAt: new Date().toISOString(),
      prompt,
    };

    return NextResponse.json({ success: true, data: pet });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid pet generation payload." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown pet generation error.",
      },
      { status: 500 },
    );
  }
}

function parseJson(value: string): any {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractErrorMessage(value: any): string | undefined {
  const message = value?.error?.message ?? value?.message ?? value?.error;
  return typeof message === "string" ? message : undefined;
}
