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
    const descriptionValue = formData.get("description");

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
    const description =
      typeof descriptionValue === "string" ? descriptionValue.trim().slice(0, 300) : "";
    const arrayBuffer = await image.arrayBuffer();
    const imageBase64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = image.type || "image/jpeg";

    const data = await recognizeFoodWithGemini({
      apiKey,
      imageBase64,
      mimeType,
      mealType,
      description,
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    const formattedError = formatRecognitionError(error);

    return NextResponse.json(
      {
        success: false,
        error: formattedError.message,
      },
      { status: formattedError.status },
    );
  }
}

function parseMealType(value: FormDataEntryValue | null): MealType {
  if (typeof value === "string" && mealTypes.includes(value as MealType)) {
    return value as MealType;
  }

  return "other";
}

function formatRecognitionError(error: unknown): {
  message: string;
  status: number;
} {
  const message = error instanceof Error ? error.message : String(error);

  if (
    message.includes("429") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.toLowerCase().includes("quota")
  ) {
    return {
      message:
        "Gemini quota is temporarily exhausted. BiteDex generated a fallback card instead.",
      status: 429,
    };
  }

  if (message.toLowerCase().includes("api key")) {
    return {
      message: "Gemini API key is invalid or missing.",
      status: 503,
    };
  }

  return {
    message: "Gemini recognition failed. BiteDex generated a fallback card instead.",
    status: 500,
  };
}
