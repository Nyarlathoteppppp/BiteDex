"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Camera,
  FlaskConical,
  LibraryBig,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import type { FoodCard, MealType, RecognizedFood } from "@/types";
import { mealTypes } from "@/types";
import { addFoodCard } from "@/lib/storage";
import { getFallbackFood, makeMockRecognition } from "@/lib/mock/foods";
import { makeMockFoodCard } from "@/lib/mock/cards";
import { getLocalDateKey, getLocalTimeKey } from "@/lib/utils/dates";
import { localizeMealType, useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/app/components/language-toggle";

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
  const { language, setLanguage } = useLanguage("zh");
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
  const text = language === "zh"
    ? {
        title: "拍摄食物",
        upload: "上传图片",
        choosePhoto: "选择食物照片",
        mealType: "餐别",
        desc: "你吃了什么？",
        descHint: "可选，帮助 AI 更准确估算份量。",
        mock: "模拟",
        ai: "AI 分析",
        preparing: "准备中",
        save: "保存到图鉴",
        saved: "已加入图鉴 ✓",
        fallback: "兜底模板",
        resultHint: "上传食物照片并运行 AI 分析来生成卡片。",
        backHome: "首页",
        pet: "宠物",
        dex: "图鉴",
      }
    : {
        title: "Capture Food",
        upload: "Upload",
        choosePhoto: "Choose a food photo",
        mealType: "Meal type",
        desc: "What did you eat?",
        descHint: "Optional. Helps AI estimate portion more accurately.",
        mock: "Mock",
        ai: "AI",
        preparing: "Preparing",
        save: "Save to Dex",
        saved: "Added to Food Dex ✓",
        fallback: "Fallback templates",
        resultHint: "Upload a food photo and run AI analysis to generate your card.",
        backHome: "Home",
        pet: "Pet",
        dex: "Dex",
      };

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

  function saveResult() {
    if (!result) {
      return;
    }

    try {
      addFoodCard(result);
      setSaved(true);
      setStatus("Added to Food Dex.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      if (msg.includes("quota") || msg.includes("QuotaExceeded") || msg.includes("storage")) {
        setStatus("Storage full. Try clearing old data or use a smaller photo.");
      } else {
        setStatus(`Save failed: ${msg}`);
      }
    }
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
          <h1 className="text-2xl font-bold sm:text-3xl">{text.title}</h1>
          <div className="ml-auto">
            <LanguageToggle language={language} onChange={setLanguage} />
          </div>
        </header>

        <section className="grid gap-4 sm:gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-lg border border-[#eadbc7] bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-bold sm:text-xl">{text.upload}</h2>

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
                  <span className="text-sm font-semibold">{text.choosePhoto}</span>
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
              <label className="text-xs font-semibold text-[#766b60] sm:text-sm">{text.mealType}</label>
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
                    {localizeMealType(type, language)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 sm:mt-5">
              <label
                htmlFor="food-description"
                className="text-xs font-semibold text-[#766b60] sm:text-sm"
              >
                {text.desc}
              </label>
              <textarea
                id="food-description"
                value={foodDescription}
                onChange={(event) => setFoodDescription(event.target.value)}
                rows={2}
                maxLength={300}
                placeholder={language === "zh" ? "例如：半碗米饭、两块炸鸡" : "e.g. half bowl of rice, two pieces of fried chicken"}
                className="mt-2 w-full resize-none rounded-lg border border-[#e4d3be] bg-white px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#d9f3ea]"
              />
              <p className="mt-1 text-[11px] font-medium text-[#85786c] sm:text-xs">
                {text.descHint}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3">
              <button
                type="button"
                disabled={!canAnalyze || isAnalyzing || isPreparingImage}
                onClick={() => analyze("mock")}
                className="inline-flex touch-manipulation items-center justify-center gap-1.5 rounded-lg border border-[#e4d3be] bg-white px-3 py-3 text-xs font-bold active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:text-sm"
              >
                <FlaskConical size={16} />
                {isPreparingImage ? text.preparing : text.mock}
              </button>
              <button
                type="button"
                disabled={!canAnalyze || isAnalyzing || isPreparingImage}
                onClick={() => analyze("ai")}
                className="inline-flex touch-manipulation items-center justify-center gap-1.5 rounded-lg bg-[#0f766e] px-3 py-3 text-xs font-bold text-white active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:text-sm"
              >
                <Sparkles size={16} />
                {isAnalyzing ? (language === "zh" ? "分析中" : "Analyzing") : text.ai}
              </button>
            </div>

            {status ? <p className="mt-3 text-xs font-medium text-[#665f56] sm:mt-4 sm:text-sm">{status}</p> : null}

            <div className="mt-4 sm:mt-5">
              <p className="text-xs font-semibold text-[#766b60] sm:text-sm">{text.fallback}</p>
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

          <div className="flex items-center justify-center lg:items-start">
            {result ? (
              <div className="flex w-full max-w-[360px] flex-col gap-4">
                {/* Cream Food Dex Card */}
                <article className="rounded-[32px] border border-[rgba(70,50,30,0.08)] bg-[rgba(255,253,248,0.96)] p-[22px] shadow-[0_24px_70px_rgba(70,50,30,0.10),inset_0_1px_0_rgba(255,255,255,0.85)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#a08a73]">
                      #{stableDexNumber(result.foodName)}
                    </span>
                    <span className="rounded-full bg-[#f3eadc] px-3 py-1.5 text-xs font-medium text-[#7b624c]">
                      {result.mealType}
                    </span>
                  </div>

                  <h2 className="mt-5 text-[28px] font-bold leading-[1.05] tracking-[-0.035em] text-[#1f1b16]">
                    {result.foodName}
                  </h2>
                  <p className="mt-2 text-sm text-[#9b856d]">
                    {result.date.replace(/-/g, ".")}
                  </p>

                  <div className="my-[22px] aspect-square w-full overflow-hidden rounded-[26px] bg-[#f1e7d8] shadow-[inset_0_0_0_1px_rgba(70,50,30,0.06)]">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt={result.foodName}
                        className="h-full w-full object-cover saturate-[0.96] contrast-[1.02]"
                      />
                    ) : null}
                  </div>

                  <p className="mb-[18px] text-[15px] leading-[1.65] text-[#4b4035]">
                    {result.advice}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#f7efe4] px-3 py-2 text-[13px] font-medium text-[#3b3027]">
                      {result.kcalMin}-{result.kcalMax} kcal
                    </span>
                    <span className="rounded-full bg-[#f7efe4] px-3 py-2 text-[13px] font-medium text-[#3b3027]">
                      Protein {result.protein}g
                    </span>
                    <span className="rounded-full bg-[#f1e4d2] px-3 py-2 text-[13px] font-medium text-[#6f563f]">
                      Energy +{Math.round(result.kcalMax / 100)}
                    </span>
                    <span className="rounded-full bg-[#f1e4d2] px-3 py-2 text-[13px] font-medium text-[#6f563f]">
                      Muscle +{Math.round(result.protein / 4)}
                    </span>
                  </div>
                </article>

                <button
                  type="button"
                  onClick={saveResult}
                  disabled={saved}
                  className="w-full touch-manipulation rounded-full bg-[#1f1b16] px-4 py-4 text-sm font-bold text-white active:scale-[0.98] disabled:bg-[#9b856d] sm:py-3"
                >
                  {saved ? text.saved : text.save}
                </button>

                {saved ? (
                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center rounded-full border border-[rgba(70,50,30,0.12)] bg-white px-3 py-2.5 text-xs font-semibold text-[#1f1b16]"
                    >
                      {text.backHome}
                    </Link>
                    <Link
                      href="/pet"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[rgba(70,50,30,0.12)] bg-white px-3 py-2.5 text-xs font-semibold text-[#1f1b16]"
                    >
                      <MessageCircle size={14} />
                      {text.pet}
                    </Link>
                    <Link
                      href="/dex"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[rgba(70,50,30,0.12)] bg-white px-3 py-2.5 text-xs font-semibold text-[#1f1b16]"
                    >
                      <LibraryBig size={14} />
                      {text.dex}
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex w-full max-w-[360px] flex-col items-center justify-center rounded-[32px] border border-[rgba(70,50,30,0.08)] bg-[rgba(255,253,248,0.96)] p-10 text-center shadow-[0_24px_70px_rgba(70,50,30,0.06)]">
                <Camera size={32} className="text-[#9b856d]" />
                <p className="mt-4 text-sm leading-6 text-[#9b856d]">
                  {text.resultHint}
                </p>
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
    const maxSide = 800;
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

    const blob = await canvasToBlob(canvas, "image/jpeg", 0.7);
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

function stableDexNumber(foodName: string): string {
  const value =
    foodName.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0) % 900 + 100;
  return String(value).padStart(3, "0");
}
