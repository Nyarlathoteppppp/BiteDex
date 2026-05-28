"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Loader2, MessageCircle, PackageOpen, Send } from "lucide-react";
import type { DailyLog, FoodCard, PetDialogue, PetState } from "@/types";
import {
  calculateDailyTotal,
  computePetState,
  generatePetDialogue,
} from "@/lib/nutrition";
import { getTodayLog, saveFoodCardFeedingReview } from "@/lib/storage";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/app/components/language-toggle";

type PetMessage = {
  food: FoodCard;
  petState: PetState;
  dialogue: PetDialogue;
  kcalRange: string;
  isAiLoading?: boolean;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function PetPage() {
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [feedingMessages, setFeedingMessages] = useState<PetMessage[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage } = useLanguage("zh");

  useEffect(() => {
    setTodayLog(getTodayLog());
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (!todayLog || todayLog.foods.length === 0) {
      setFeedingMessages([]);
      return;
    }

    const localMessages = todayLog.foods.map<PetMessage>((food, index) => {
      const foodsSoFar = todayLog.foods.slice(0, index + 1);
      const petState = computePetState(foodsSoFar, language);
      const dialogue = generatePetDialogue(petState, foodsSoFar, language);
      const total = calculateDailyTotal(foodsSoFar);

      return {
        food,
        petState,
        dialogue: food.feedingReview
          ? {
              title: language === "zh" ? "宠物日报" : "Pet Review",
              message: food.feedingReview.message,
              reason: food.feedingReview.reason,
              suggestion: food.feedingReview.suggestion,
            }
          : dialogue,
        kcalRange: `${total.kcalMin}-${total.kcalMax} kcal`,
        isAiLoading: !food.feedingReview,
      };
    });

    setFeedingMessages(localMessages);

    localMessages.forEach((msg, index) => {
      const foodsSoFar = todayLog.foods.slice(0, index + 1);
      const previousFoodNames = foodsSoFar.slice(0, -1).map((f) => f.foodName);

      if (!msg.food.feedingReview) {
        fetchFeedingReview(msg.food, msg.petState, calculateDailyTotal(foodsSoFar), previousFoodNames, language)
        .then((aiDialogue) => {
          saveFoodCardFeedingReview(msg.food.date, msg.food.id, {
            message: aiDialogue.message,
            reason: aiDialogue.reason,
            suggestion: aiDialogue.suggestion,
            model: "deepseek-v4-flash",
            generatedAt: new Date().toISOString(),
          });
          setFeedingMessages((prev) =>
            prev.map((m) =>
              m.food.id === msg.food.id
                ? { ...m, dialogue: aiDialogue, isAiLoading: false }
                : m,
            ),
          );
          setTodayLog(getTodayLog());
        })
        .catch(() => {
          setFeedingMessages((prev) =>
            prev.map((m) =>
              m.food.id === msg.food.id ? { ...m, isAiLoading: false } : m,
            ),
          );
        });
      }
    });
  }, [todayLog, language]);

  const text = language === "zh"
    ? {
        loading: "宠物房加载中...",
        dashboard: "首页",
        title: "宠物房",
        box: "仓库",
        feed: "投喂",
        currentMood: "当前情绪",
        waitBite: "我在等今天的第一口",
        cards: "卡片数",
        calories: "热量",
        protein: "蛋白质",
        feedingLog: "喂养记录",
        noCards: "今天还没有食物卡。",
        chat: "和宠物聊天",
        askHint: "可以问宠物今天饮食、营养建议，或者随便聊聊！",
        thinking: "思考中...",
        ask: "问问你的宠物...",
        feedSentence: "我喂你",
      }
    : {
        loading: "Loading pet room...",
        dashboard: "Dashboard",
        title: "Pet Room",
        box: "Box",
        feed: "Feed",
        currentMood: "Current Mood",
        waitBite: "I am waiting for today's first bite",
        cards: "Cards",
        calories: "Calories",
        protein: "Protein",
        feedingLog: "Feeding Log",
        noCards: "No food cards yet today.",
        chat: "Chat with Pet",
        askHint: "Ask your pet anything about today's diet, nutrition tips, or just chat!",
        thinking: "Thinking...",
        ask: "Ask your pet...",
        feedSentence: "I feed you",
      };

  async function handleSend() {
    const msg = inputValue.trim();
    if (!msg || isSending || !todayLog) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: msg,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsSending(true);

    try {
      const response = await fetch("/api/pet-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: msg,
          petState: todayLog.petState,
          todayTotal: todayLog.total,
          recentFoods: todayLog.foods.slice(-5).map((f) => ({
            foodName: f.foodName,
            kcalMin: f.kcalMin,
            kcalMax: f.kcalMax,
            protein: f.protein,
            carbs: f.carbs,
            fat: f.fat,
            tags: f.tags,
            mealType: f.mealType,
          })),
          chatHistory: chatMessages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.success && data.reply) {
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.reply,
        };
        setChatMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `⚠️ ${data.error || "Failed to get reply"}`,
        };
        setChatMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "⚠️ Network error. Please try again.",
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  }

  if (!todayLog) {
    return (
      <main className="min-h-screen bg-[#fffaf3] px-4 py-5 text-[#231f20]">
        <div className="mx-auto max-w-6xl rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
          {text.loading}
        </div>
      </main>
    );
  }

  const currentPet = todayLog.petState;
  const latestMessage = feedingMessages[feedingMessages.length - 1];

  return (
    <main className="min-h-screen bg-[#fffaf3] text-[#231f20]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:gap-6 sm:px-8 sm:py-6 lg:px-10">
        <header className="flex items-center justify-between border-b border-[#eadbc7] pb-4 sm:pb-5">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f766e]"
            >
              <ArrowLeft size={18} />
              {text.dashboard}
            </Link>
            <h1 className="mt-2 text-2xl font-bold sm:mt-3 sm:text-3xl">{text.title}</h1>
          </div>

          <div className="flex gap-2">
            <LanguageToggle language={language} onChange={setLanguage} />
            <Link
              href="/pet-warehouse"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#e4d3be] bg-white px-3 py-2 text-xs font-semibold shadow-sm sm:gap-2 sm:px-4 sm:text-sm"
            >
              <PackageOpen size={16} />
              {text.box}
            </Link>
            <Link
              href="/capture"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0f766e] px-3 py-2 text-xs font-semibold text-white shadow-sm sm:gap-2 sm:px-4 sm:text-sm"
            >
              <Camera size={16} />
              {text.feed}
            </Link>
          </div>
        </header>

        <section className="overflow-hidden rounded-lg border border-[#eadbc7] bg-white shadow-sm">
          <div className="grid lg:grid-cols-[320px_1fr]">
            <div className="flex flex-col items-center justify-center bg-[#d9f3ea] p-5 sm:p-6">
              <PetImage src={currentPet.imageUrl} title={currentPet.title} />
              <p className="mt-3 rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-[#0f766e] shadow-sm sm:mt-4 sm:px-4 sm:py-2">
                {currentPet.title}
              </p>
            </div>

            <div className="p-4 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#0f766e] sm:text-sm">
                {text.currentMood}
              </p>
              <h2 className="mt-1.5 text-xl font-bold sm:mt-2 sm:text-3xl">
                {latestMessage
                  ? (language === "zh" ? `我刚尝了 ${latestMessage.food.foodName}` : `I just tasted ${latestMessage.food.foodName}`)
                  : text.waitBite}
              </h2>
              <p className="mt-2 max-w-2xl text-base font-semibold leading-7 text-[#3b3430] sm:mt-3 sm:text-lg sm:leading-8">
                {(latestMessage?.dialogue.message ?? generatePetDialogue(currentPet, todayLog.foods, language).message)}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-3">
                <MiniMetric label={text.cards} value={todayLog.total.records} />
                <MiniMetric
                  label={text.calories}
                  value={`${todayLog.total.kcalMin}-${todayLog.total.kcalMax}`}
                />
                <MiniMetric label={text.protein} value={`${todayLog.total.protein}g`} />
              </div>
            </div>
          </div>
        </section>

        {/* Feeding Log */}
        <section className="rounded-lg border border-[#eadbc7] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-[#0f766e]" />
            <h2 className="text-lg font-bold sm:text-xl">{text.feedingLog}</h2>
          </div>

          {feedingMessages.length === 0 ? (
            <div className="mt-4 flex min-h-[120px] flex-col items-center justify-center rounded-lg bg-[#f8efe3] p-5 text-center text-[#766b60]">
              <p className="text-sm font-semibold">{text.noCards}</p>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3 sm:gap-4">
              {feedingMessages.map((message) => (
                <FeedingTurn key={message.food.id} message={message} feedSentence={text.feedSentence} />
              ))}
            </div>
          )}
        </section>

        {/* AI Chat */}
        <section className="rounded-lg border border-[#0f766e]/30 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-[#0f766e]" />
            <h2 className="text-lg font-bold sm:text-xl">{text.chat}</h2>
            <span className="rounded bg-[#d9f3ea] px-2 py-0.5 text-[10px] font-bold text-[#0f766e] sm:text-xs">
              AI
            </span>
          </div>

          <div className="mt-4 flex max-h-[400px] flex-col gap-3 overflow-y-auto sm:max-h-[500px]">
            {chatMessages.length === 0 && (
              <div className="flex min-h-[100px] items-center justify-center rounded-lg bg-[#f8efe3] p-4 text-center text-sm text-[#766b60]">
                {text.askHint}
              </div>
            )}
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[85%] rounded-lg p-3 text-sm leading-6 sm:max-w-[75%] ${
                  msg.role === "user"
                    ? "ml-auto bg-[#0f766e] text-white"
                    : "mr-auto bg-[#f8efe3] text-[#3b3430]"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {isSending && (
              <div className="mr-auto flex items-center gap-2 rounded-lg bg-[#f8efe3] p-3 text-sm text-[#766b60]">
                <Loader2 size={14} className="animate-spin" />
                {text.thinking}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="mt-4 flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={text.ask}
              disabled={isSending}
              className="flex-1 rounded-lg border border-[#e4d3be] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#d9f3ea] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isSending}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0f766e] text-white disabled:opacity-50 sm:h-auto sm:w-auto sm:px-4 sm:py-2.5"
            >
              <Send size={16} />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function FeedingTurn({ message, feedSentence }: { message: PetMessage; feedSentence: string }) {
  return (
    <article className="flex flex-col gap-2 sm:gap-3">
      <div className="ml-auto flex max-w-[90%] items-center gap-2 rounded-lg bg-[#0f766e] p-2.5 text-white sm:max-w-[760px] sm:gap-3 sm:p-3">
        <FoodThumb src={message.food.imageUrl} name={message.food.foodName} />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold opacity-80 sm:text-sm">{message.food.time}</p>
          <p className="truncate text-sm font-bold sm:text-base">{feedSentence} {message.food.foodName}</p>
          <p className="text-xs opacity-90 sm:text-sm">
            {message.food.kcalMin}-{message.food.kcalMax} kcal · Score{" "}
            {message.food.biteScore}
          </p>
        </div>
      </div>

      <div className="mr-auto grid max-w-[95%] grid-cols-[48px_1fr] gap-2 sm:max-w-[820px] sm:grid-cols-[64px_1fr] sm:gap-3">
        <div className="h-12 w-12 rounded-lg bg-[#d9f3ea] p-1 sm:h-16 sm:w-16 sm:p-1.5">
          <PetImage src={message.petState.imageUrl} title={message.petState.title} small />
        </div>
        <div className="rounded-lg bg-[#f8efe3] p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#0f766e] sm:text-sm">
              {message.petState.title}
            </p>
            <div className="flex items-center gap-2">
              {message.isAiLoading && (
                <Loader2 size={12} className="animate-spin text-[#0f766e]" />
              )}
              <p className="text-[11px] font-semibold text-[#766b60] sm:text-sm">
                {message.kcalRange}
              </p>
            </div>
          </div>
          <p className="mt-1.5 text-sm font-bold leading-6 sm:mt-2 sm:text-lg sm:leading-8">
            {message.dialogue.message}
          </p>
          <p className="mt-1.5 text-xs leading-5 text-[#665f56] sm:mt-2 sm:text-base sm:leading-7">{message.dialogue.reason}</p>
          <p className="mt-1.5 text-xs leading-5 text-[#665f56] sm:mt-2 sm:text-base sm:leading-7">
            {message.dialogue.suggestion}
          </p>
        </div>
      </div>
    </article>
  );
}

function PetImage({
  src,
  title,
  small = false,
}: {
  src: string;
  title: string;
  small?: boolean;
}) {
  return (
    <div
      className={`flex aspect-square items-center justify-center rounded-lg bg-white/70 ${
        small ? "h-full w-full p-1" : "w-full max-w-[180px] p-2 shadow-sm sm:max-w-[250px] sm:p-3"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${title} pet`}
        className="h-full w-full object-contain"
        onError={(event) => {
          event.currentTarget.style.display = "none";
          event.currentTarget.nextElementSibling?.classList.remove("hidden");
        }}
      />
      <div className="hidden text-center text-xs font-bold text-[#0f766e]">
        {title}
      </div>
    </div>
  );
}

function FoodThumb({ src, name }: { src: string; name: string }) {
  return (
    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white/20 sm:h-14 sm:w-14">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : null}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-[#f8efe3] p-2.5 sm:p-4">
      <p className="text-[11px] font-medium text-[#766b60] sm:text-sm">{label}</p>
      <p className="mt-0.5 text-base font-bold sm:mt-1 sm:text-2xl">{value}</p>
    </div>
  );
}

async function fetchFeedingReview(
  food: FoodCard,
  petState: PetState,
  todayTotal: { records: number; kcalMin: number; kcalMax: number; protein: number; carbs: number; fat: number },
  previousFoods: string[],
  language: "zh" | "en",
): Promise<PetDialogue> {
  const response = await fetch("/api/feeding-review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      food: {
        foodName: food.foodName,
        kcalMin: food.kcalMin,
        kcalMax: food.kcalMax,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        tags: food.tags,
        mealType: food.mealType,
        portion: food.portion,
        biteScore: food.biteScore,
      },
      petState,
      todayTotal,
      previousFoods,
      language,
    }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed");
  }

  return {
    title: "Pet Review",
    message: data.data.message,
    reason: data.data.reason,
    suggestion: data.data.suggestion,
  };
}
