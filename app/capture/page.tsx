"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Check,
  FlaskConical,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import type { FoodCard, MealType, RecognizedFood } from "@/types";
import { mealTypes } from "@/types";
import { addFoodCard } from "@/lib/storage";
import { getFallbackFood, makeMockRecognition } from "@/lib/mock/foods";
import { makeMockFoodCard } from "@/lib/mock/cards";
import { getLocalDateKey, getLocalTimeKey } from "@/lib/utils/dates";

type AnalyzeMode = "mock" | "gemini";

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saved, setSaved] = useState(false);

  const canAnalyze = Boolean(file && previewUrl);

  const fallbackOptions = useMemo(
    () => ["Rice Bowl", "Fried Chicken", "Milk Tea", "Salad", "Chocolate Cake"],
    [],
  );

  async function handleFileChange(nextFile: File | null) {
    setFile(nextFile);
    setResult(null);
    setSaved(false);
    setStatus("");

    if (!nextFile) {
      setPreviewUrl("");
      setSavedImageUrl("");
      return;
    }

    setPreviewUrl(URL.createObjectURL(nextFile));
    setSavedImageUrl(await readFileAsDataUrl(nextFile));
  }

  async function analyze(mode: AnalyzeMode) {
    if (!file) {
      setStatus("Upload a food image first.");
      return;
    }

    setIsAnalyzing(true);
    setSaved(false);
    setStatus(mode === "mock" ? "Generating mock food card..." : "Calling Gemini...");

    try {
      const recognized =
        mode === "mock"
          ? makeMockRecognition(mealType)
          : await analyzeWithGemini(file, mealType, foodDescription);

      setResult(toFoodCard(recognized));
      setStatus(mode === "mock" ? "Mock analysis ready." : "Gemini analysis ready.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `Gemini failed: ${error.message}`
          : "Gemini failed. Use mock or fallback.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  function useFallback(foodName: string) {
    setResult(toFoodCard(getFallbackFood(foodName, mealType)));
    setSaved(false);
    setStatus("Fallback card ready.");
  }

  function saveResult() {
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
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-6 sm:px-8">
        <header className="flex flex-col gap-4 border-b border-[#eadbc7] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f766e]"
            >
              <ArrowLeft size={18} />
              Dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-bold">Capture Food</h1>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold">Upload</h2>

            <label className="mt-4 flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#d5c2aa] bg-[#f8efe3] text-center">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Food preview"
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-[#766b60]">
                  <Camera size={38} />
                  <span className="font-semibold">Choose a food photo</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
              />
            </label>

            <div className="mt-5">
              <label className="text-sm font-semibold text-[#766b60]">Meal type</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {mealTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMealType(type)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
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

            <div className="mt-5">
              <label
                htmlFor="food-description"
                className="text-sm font-semibold text-[#766b60]"
              >
                What did you eat?
              </label>
              <textarea
                id="food-description"
                value={foodDescription}
                onChange={(event) => setFoodDescription(event.target.value)}
                rows={3}
                maxLength={300}
                placeholder="e.g. half bowl of rice, two pieces of fried chicken, a little sauce"
                className="mt-2 w-full resize-none rounded-lg border border-[#e4d3be] bg-white px-3 py-3 text-sm leading-6 outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#d9f3ea]"
              />
              <p className="mt-1 text-xs font-medium text-[#85786c]">
                Optional. This helps Gemini estimate food type and portion more accurately.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={!canAnalyze || isAnalyzing}
                onClick={() => analyze("mock")}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e4d3be] bg-white px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FlaskConical size={18} />
                Mock Analyze
              </button>
              <button
                type="button"
                disabled={!canAnalyze || isAnalyzing}
                onClick={() => analyze("gemini")}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f766e] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles size={18} />
                Gemini Analyze
              </button>
            </div>

            {status ? <p className="mt-4 text-sm font-medium text-[#665f56]">{status}</p> : null}

            <div className="mt-5">
              <p className="text-sm font-semibold text-[#766b60]">Fallback templates</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {fallbackOptions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => useFallback(name)}
                    className="rounded-lg border border-[#e4d3be] bg-white px-3 py-2 text-sm font-semibold"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold">Food Card</h2>

            {result ? (
              <div className="mt-4 flex flex-col gap-4">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wider text-[#0f766e]">
                        {result.rarity} · Bite Score {result.biteScore}
                      </p>
                      <h3 className="mt-1 text-3xl font-bold">{result.foodName}</h3>
                    </div>
                    <p className="rounded-lg bg-[#f8efe3] px-3 py-2 text-sm font-bold">
                      {result.kcalMin}-{result.kcalMax} kcal
                    </p>
                  </div>
                  <p className="mt-2 text-[#665f56]">{result.portion}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Macro label="Protein" value={result.protein} />
                  <Macro label="Carbs" value={result.carbs} />
                  <Macro label="Fat" value={result.fat} />
                </div>

                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-[#d9f3ea] px-3 py-1 text-sm font-semibold text-[#0f766e]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="rounded-lg bg-[#f8efe3] p-4 leading-7 text-[#665f56]">
                  {result.advice}
                </p>

                <button
                  type="button"
                  onClick={saveResult}
                  disabled={saved}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#231f20] px-4 py-3 text-sm font-bold text-white disabled:cursor-default disabled:bg-[#7b746b]"
                >
                  <Check size={18} />
                  {saved ? "Added" : "Add to Today"}
                </button>
                {saved ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center rounded-lg border border-[#e4d3be] bg-white px-4 py-3 text-sm font-bold"
                    >
                      View Dashboard
                    </Link>
                    <Link
                      href="/pet"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e4d3be] bg-white px-4 py-3 text-sm font-bold"
                    >
                      <MessageCircle size={18} />
                      Pet Reply
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 flex min-h-[360px] items-center justify-center rounded-lg bg-[#f8efe3] p-6 text-center text-[#766b60]">
                Upload a food photo and run mock or Gemini analysis.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

async function analyzeWithGemini(
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
  const payload = (await response.json()) as RecognizeApiResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.success ? "Recognition failed." : payload.error);
  }

  return payload.data;
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
    <div className="rounded-lg bg-[#f8efe3] p-4">
      <p className="text-sm font-medium text-[#766b60]">{label}</p>
      <p className="mt-1 text-2xl font-bold">
        {value}
        <span className="ml-1 text-sm font-semibold">g</span>
      </p>
    </div>
  );
}
