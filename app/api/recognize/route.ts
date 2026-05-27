import { NextResponse } from "next/server";
import { mealTypes, type MealType } from "@/types";
import { recognizeFoodWithGemini } from "@/lib/recognition/gemini";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "GEMINI_API_KEY is not configured.",
        },
        { status: 503 },
      );
    }

    const contentType = request.headers.get("content-type") ?? "";

    if (
      !contentType.includes("multipart/form-data") &&
      !contentType.includes("application/x-www-form-urlencoded")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Expected multipart/form-data with image and mealType.",
        },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");
    const mealTypeValue = formData.get("mealType");

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing image file.",
        },
        { status: 400 },
      );
    }

    const mealType = parseMealType(mealTypeValue);
    const arrayBuffer = await image.arrayBuffer();
    const imageBase64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = image.type || "image/jpeg";

    const data = await recognizeFoodWithGemini({
      apiKey,
      imageBase64,
      mimeType,
      mealType,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Recognition failed.",
      },
      { status: 500 },
    );
  }
}

function parseMealType(value: FormDataEntryValue | null): MealType {
  if (typeof value === "string" && mealTypes.includes(value as MealType)) {
    return value as MealType;
  }

  return "other";
}
