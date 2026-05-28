"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Check,
  FlaskConical,
  MessageCircle,
  PackageOpen,
  Sparkles,
} from "lucide-react";
import type { FoodCard, MealType, RecognizedFood } from "@/types";
import { mealTypes } from "@/types";
import { addFoodCard } from "@/lib/storage";
import { getFallbackFood, makeMockRecognition } from "@/lib/mock/foods";
import { makeMockFoodCard } from "@/lib/mock/cards";
import { getLocalDateKey, getLocalTimeKey } from "@/lib/utils/dates";

type AnalyzeMode = "mock" | "ai";

type RecognizeApiResponse =
  | {
      success: true;
      data: RecognizedFood;
    }
  | {
      success: false;
      error: string;
    };

export default function CapturePage() {
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [savedImageUrl, setSavedImageUrl] = useState<string>("");
  const [foodDescription, setFoodDescription] = useState<string>("");
  const [result, setResult] = useState<FoodCard | null>(null);
  const [status, setStatus] = useState<string>("");
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saved, setSaved] = useState(false);

  const canAnalyze = Boolean(file && previewUrl) && !isPreparingImage;

  const fallbackOptions = useMemo(
    () => ["Rice Bowl", "Fried Chicken", "Milk Tea", "Salad", "Chocolate Cake"],
    [],
  );

  async function handleFileChange(nextFile: File | null) {
    setFile(null);
    setResult(null);
    setSaved(false);
    setStatus("");

    if (!nextFile) {
      setPreviewUrl("");
      setSavedImageUrl("");
      return;
    }

    setIsPreparingImage(true);
    setStatus("Preparing photo...");

    try {
      const prepared = await prepareImageForUpload(nextFile);

      setFile(prepared.file);
      setPreviewUrl(prepared.dataUrl);
      setSavedImageUrl(prepared.dataUrl);
      setStatus(
        prepared.normalized
          ? "Photo ready. It was resized for faster AI analysis."
          : "Photo ready.",
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `Photo failed: ${error.message}`
          : "Photo failed. Choose another image.",
      );
    } finally {
      setIsPreparingImage(false);
    }
  }

  async function analyze(mode: AnalyzeMode) {
    if (!file) {
      setStatus("Upload a food image first.");
      return;
    }

    setIsAnalyzing(true);
    setSaved(false);
    setStatus(mode === "mock" ? "Generating mock food card..." : "Calling AI...");

    try {
      const recognized =
        mode === "mock"
          ? makeMockRecognition(mealType)
          : await analyzeWithAI(file, mealType, foodDescription);

      setResult(toFoodCard(recognized));
      setStatus(mode === "mock" ? "Mock analysis ready." : "AI analysis ready.");
    } catch (error) {
      const message = getFriendlyErrorMessage(error);

      if (mode === "ai") {
        const fallback = makeRecognitionFallback(mealType, foodDescription);

        setResult(toFoodCard(fallback));
        setStatus(`${message} A fallback food card is ready and can still be saved.`);
        return;
      }

      setStatus(message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function useFallback(foodName: string) {
    setResult(toFoodCard(getFallbackFood(foodName, mealType)));
    setSaved(false);
    setStatus("Fallback card ready.");
  }

  async function saveResult() {
    if (!result) {
      return;
    }

    addFoodCard(result);
    setSaved(true);
    setStatus("Added to today's timeline.");
  }

  function toFoodCard(food: RecognizedFood): FoodCard {
    const now = new Date();

    return makeMockFoodCard(food, {
      date: getLocalDateKey(now),
      time: getLocalTimeKey(now),
      mealType,
      imageUrl: savedImageUrl || previewUrl,
      createdAt: now.toISOString(),
    });
  }

  return (
    <main className="min-h-screen bg-[#fffaf3] text-[#231f20]">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:gap-6 sm:px-8 sm:py-6">
        <header className="flex items-center gap-3 border-b border-[#eadbc7] pb-4 sm:pb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f766e]"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold sm:text-3xl">Capture Food</h1>
        </header>

        <section className="grid gap-4 sm:gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-lg border border-[#eadbc7] bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-bold sm:text-xl">Upload</h2>

            <label className="mt-3 flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#d5c2aa] bg-[#f8efe3] text-center sm:mt-4">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Food preview"
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-[#766b60] sm:gap-3">
                  <Camera size={32} />
                  <span className="text-sm font-semibold">Choose a food photo</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*,.heic,.heif"
                className="sr-only"
                onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
              />
            </label>

            <div className="mt-4 sm:mt-5">
              <label className="text-xs font-semibold text-[#766b60] sm:text-sm">Meal type</label>
              <div className="mt-2 grid grid-cols-3 gap-1.5 sm:gap-2">
                {mealTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMealType(type)}
                    className={`rounded-lg border px-2 py-1.5 text-xs font-semibold sm:px-3 sm:py-2 sm:text-sm ${
                      mealType === type
                        ? "border-[#0f766e] bg-[#d9f3ea] text-[#0f766e]"
                        : "border-[#e4d3be] bg-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 sm:mt-5">
              <label
                htmlFor="food-description"
                className="text-xs font-semibold text-[#766b60] sm:text-sm"
              >
                What did you eat?
              </label>
              <textarea
                id="food-description"
                value={foodDescription}
                onChange={(event) => setFoodDescription(event.target.value)}
                rows={2}
                maxLength={300}
                placeholder="e.g. half bowl of rice, two pieces of fried chicken"
                className="mt-2 w-full resize-none rounded-lg border border-[#e4d3be] bg-white px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#d9f3ea]"
              />
              <p className="mt-1 text-[11px] font-medium text-[#85786c] sm:text-xs">
                Optional. Helps AI estimate portion more accurately.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3">
              <button
                type="button"
                disabled={!canAnalyze || isAnalyzing || isPreparingImage}
                onClick={() => analyze("mock")}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#e4d3be] bg-white px-3 py-2.5 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
              >
                <FlaskConical size={16} />
                {isPreparingImage ? "Preparing" : "Mock"}
              </button>
              <button
                type="button"
                disabled={!canAnalyze || isAnalyzing || isPreparingImage}
                onClick={() => analyze("ai")}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0f766e] px-3 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
              >
                <Sparkles size={16} />
                {isAnalyzing ? "Analyzing" : "AI"}
              </button>
            </div>

            {status ? <p className="mt-3 text-xs font-medium text-[#665f56] sm:mt-4 sm:text-sm">{status}</p> : null}

            <div className="mt-4 sm:mt-5">
              <p className="text-xs font-semibold text-[#766b60] sm:text-sm">Fallback templates</p>
              <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                {fallbackOptions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => useFallback(name)}
                    className="rounded-lg border border-[#e4d3be] bg-white px-2.5 py-1.5 text-xs font-semibold sm:px-3 sm:py-2 sm:text-sm"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#eadbc7] bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-bold sm:text-xl">Food Card</h2>

            {result ? (
              <div className="mt-3 flex flex-col gap-3 sm:mt-4 sm:gap-4">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#0f766e] sm:text-sm">
                        {result.rarity} · Score {result.biteScore}
                      </p>
                      <h3 className="mt-1 text-2xl font-bold sm:text-3xl">{result.foodName}</h3>
                    </div>
                    <p className="rounded-lg bg-[#f8efe3] px-2.5 py-1.5 text-xs font-bold sm:px-3 sm:py-2 sm:text-sm">
                      {result.kcalMin}-{result.kcalMax} kcal
                    </p>
                  </div>
                  <p className="mt-1.5 text-sm text-[#665f56]">{result.portion}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <Macro label="Protein" value={result.protein} />
                  <Macro label="Carbs" value={result.carbs} />
                  <Macro label="Fat" value={result.fat} />
                </div>

                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {result.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-[#d9f3ea] px-2 py-0.5 text-xs font-semibold text-[#0f766e] sm:px-3 sm:py-1 sm:text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="rounded-lg bg-[#f8efe3] p-3 text-sm leading-6 text-[#665f56] sm:p-4 sm:leading-7">
                  {result.advice}
                </p>

                <button
                  type="button"
                  onClick={saveResult}
                  disabled={saved}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#231f20] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-default disabled:bg-[#7b746b] sm:py-3"
                >
                  <Check size={18} />
                  {saved ? "Added" : "Add to Today"}
                </button>

                {saved ? (
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center rounded-lg border border-[#e4d3be] bg-white px-3 py-2.5 text-xs font-bold sm:px-4 sm:py-3 sm:text-sm"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/pet"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#e4d3be] bg-white px-3 py-2.5 text-xs font-bold sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
                    >
                      <MessageCircle size={16} />
                      Pet
                    </Link>
                    <Link
                      href="/pet-warehouse"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#e4d3be] bg-white px-3 py-2.5 text-xs font-bold sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
                    >
                      <PackageOpen size={16} />
                      Box
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-3 flex min-h-[200px] items-center justify-center rounded-lg bg-[#f8efe3] p-5 text-center text-sm text-[#766b60] sm:mt-4 sm:min-h-[360px] sm:p-6">
                Upload a food photo and run mock or AI analysis.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function makeRecognitionFallback(
  mealType: MealType,
  description: string,
): RecognizedFood {
  const normalized = description.toLowerCase();

  if (normalized.includes("milk tea") || normalized.includes("奶茶")) {
    return getFallbackFood("Milk Tea", mealType);
  }

  if (
    normalized.includes("cake") ||
    normalized.includes("dessert") ||
    normalized.includes("甜品") ||
    normalized.includes("蛋糕")
  ) {
    return getFallbackFood("Chocolate Cake", mealType);
  }

  if (normalized.includes("fried") || normalized.includes("炸")) {
    return getFallbackFood("Fried Chicken", mealType);
  }

  if (normalized.includes("salad") || normalized.includes("沙拉")) {
    return getFallbackFood("Salad", mealType);
  }

  if (normalized.includes("rice") || normalized.includes("饭")) {
    return getFallbackFood("Rice Bowl", mealType);
  }

  return makeMockRecognition(mealType);
}

function getFriendlyErrorMessage(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message : String(error);

  if (
    rawMessage.includes("429") ||
    rawMessage.includes("RESOURCE_EXHAUSTED") ||
    rawMessage.toLowerCase().includes("quota")
  ) {
    return "AI quota is temporarily exhausted.";
  }

  if (
    rawMessage.includes("503") ||
    rawMessage.includes("AI_API_KEY")
  ) {
    return "AI is not configured on this server.";
  }

  return rawMessage ? `AI failed: ${rawMessage}` : "AI failed.";
}

async function analyzeWithAI(
  file: File,
  mealType: MealType,
  description: string,
): Promise<RecognizedFood> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("mealType", mealType);
  formData.append("description", description.trim());

  const response = await fetch("/api/recognize", {
    method: "POST",
    body: formData,
  });
  const payload = await readApiJson<RecognizeApiResponse>(response);

  if (!response.ok || !payload.success) {
    throw new Error(payload.success ? "Recognition failed." : payload.error);
  }

  return payload.data;
}

async function readApiJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error(`Server returned ${response.status} without JSON.`);
  }
}

async function prepareImageForUpload(file: File): Promise<{
  file: File;
  dataUrl: string;
  normalized: boolean;
}> {
  if (!file.type.startsWith("image/") && !isHeicLike(file.name)) {
    throw new Error("Please choose an image file.");
  }

  const originalDataUrl = await readFileAsDataUrl(file);

  try {
    const image = await loadImage(originalDataUrl);
    const maxSide = 1400;
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas is not available.");
    }

    context.drawImage(image, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, "image/jpeg", 0.86);
    const normalizedFile = new File([blob], replaceImageExtension(file.name), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    return {
      file: normalizedFile,
      dataUrl: await readFileAsDataUrl(normalizedFile),
      normalized: true,
    };
  } catch {
    return {
      file,
      dataUrl: originalDataUrl,
      normalized: false,
    };
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Cannot load this image in the browser."));
    image.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("Cannot convert this image."));
      },
      type,
      quality,
    );
  });
}

function replaceImageExtension(fileName: string): string {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  return `${baseName || "bitedex-food"}.jpg`;
}

function isHeicLike(fileName: string): boolean {
  return /\.(heic|heif)$/i.test(fileName);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

function Macro({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-[#f8efe3] p-2.5 sm:p-4">
      <p className="text-[11px] font-medium text-[#766b60] sm:text-sm">{label}</p>
      <p className="mt-0.5 text-lg font-bold sm:mt-1 sm:text-2xl">
        {value}
        <span className="ml-0.5 text-xs font-semibold sm:ml-1 sm:text-sm">g</span>
      </p>
    </div>
  );
}
