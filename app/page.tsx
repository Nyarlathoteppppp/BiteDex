"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Camera,
  ChartNoAxesCombined,
  LibraryBig,
  MessageCircle,
  PackageOpen,
  Trash2,
} from "lucide-react";
import type { DailyLog } from "@/types";
import { deleteFoodCard, getTodayLog } from "@/lib/storage";
import { buildDailyLog } from "@/lib/nutrition";
import { localizeMealType, useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/app/components/language-toggle";

export default function Home() {
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const { language, setLanguage } = useLanguage("zh");

  useEffect(() => {
    setTodayLog(getTodayLog());
  }, []);

  if (!todayLog) {
    return (
      <main className="min-h-screen bg-[#fffaf3] px-4 py-5 text-[#231f20]">
        <div className="mx-auto max-w-6xl rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
          {language === "zh" ? "BiteDex 加载中..." : "Loading BiteDex..."}
        </div>
      </main>
    );
  }

  const displayLog = buildDailyLog(todayLog.date, todayLog.foods, language);
  const { total, petState, dialogue, highlights, foods } = displayLog;
  const latestFood = foods[foods.length - 1];
  const text =
    language === "zh"
      ? {
          loading: "BiteDex 加载中...",
          title: "一口图鉴",
          upload: "拍照",
          dex: "图鉴",
          pet: "宠物",
          box: "仓库",
          analysis: "分析",
          feeding: "喂养状态",
          waiting: "等待投喂",
          fed: "刚刚投喂",
          today: "今日总览",
          records: "记录数",
          calories: "热量",
          protein: "蛋白质",
          carbs: "碳水",
          fat: "脂肪",
          state: "状态",
          highlights: "今日亮点",
          highestCal: "最高热量",
          highestProtein: "最高蛋白",
          assassin: "热量刺客",
          noData: "暂无",
          timeline: "今日时间线",
          noCards: "今天还没有食物卡，拍一张开始记录吧。",
          del: "删除",
          none: "无",
        }
      : {
          loading: "Loading BiteDex...",
          title: "BiteDex",
          upload: "Upload",
          dex: "Dex",
          pet: "Pet",
          box: "Box",
          analysis: "Analysis",
          feeding: "Feeding Pet",
          waiting: "Waiting for food",
          fed: "Fed",
          today: "Today Summary",
          records: "Records",
          calories: "Calories",
          protein: "Protein",
          carbs: "Carbs",
          fat: "Fat",
          state: "State",
          highlights: "Today Highlights",
          highestCal: "Highest Calorie",
          highestProtein: "Highest Protein",
          assassin: "Calorie Assassin",
          noData: "No data",
          timeline: "Today Timeline",
          noCards: "No food cards yet. Upload a photo to start today's log.",
          del: "Delete",
          none: "None",
        };

  function handleDelete(foodId: string) {
    if (!todayLog) {
      return;
    }

    setTodayLog(deleteFoodCard(foodId, todayLog.date));
  }

  return (
    <main className="min-h-screen bg-[#fffaf3] text-[#231f20]">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:gap-8 sm:px-8 sm:py-6 lg:px-10">
        <header className="flex flex-col gap-3 border-b border-[#eadbc7] pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0f766e] sm:text-sm">
              BiteDex MVP
            </p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-normal sm:mt-1 sm:text-3xl">{text.title}</h1>
          </div>
          <div className="flex items-center gap-2">
          <nav className="grid grid-cols-5 gap-2 sm:flex sm:flex-wrap">
            <Link
              href="/capture"
              className="inline-flex flex-col items-center gap-1 rounded-lg bg-[#0f766e] px-3 py-2 text-xs font-semibold text-white shadow-sm sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
            >
              <Camera size={18} />
              <span>{text.upload}</span>
            </Link>
            <Link
              href="/dex"
              className="inline-flex flex-col items-center gap-1 rounded-lg border border-[#e4d3be] bg-white px-3 py-2 text-xs font-semibold sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
            >
              <LibraryBig size={18} />
              <span>{text.dex}</span>
            </Link>
            <Link
              href="/pet"
              className="inline-flex flex-col items-center gap-1 rounded-lg border border-[#e4d3be] bg-white px-3 py-2 text-xs font-semibold sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
            >
              <MessageCircle size={18} />
              <span>{text.pet}</span>
            </Link>
            <Link
              href="/pet-warehouse"
              className="inline-flex flex-col items-center gap-1 rounded-lg border border-[#e4d3be] bg-white px-3 py-2 text-xs font-semibold sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
            >
              <PackageOpen size={18} />
              <span>{text.box}</span>
            </Link>
            <Link
              href="/analysis"
              className="inline-flex flex-col items-center gap-1 rounded-lg border border-[#e4d3be] bg-white px-3 py-2 text-xs font-semibold sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
            >
              <ChartNoAxesCombined size={18} />
              <span>{text.analysis}</span>
            </Link>
          </nav>
            <LanguageToggle language={language} onChange={setLanguage} />
          </div>
        </header>

        <section className="grid gap-4 sm:gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-lg border border-[#eadbc7] bg-white shadow-sm">
            <div className="grid gap-0 sm:grid-cols-[250px_1fr]">
              <div className="flex min-h-[200px] flex-col items-center justify-center bg-[#d9f3ea] p-4 sm:min-h-[270px] sm:p-5">
                <PetImage src={petState.imageUrl} title={petState.title} />
                <p className="mt-2 rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-[#0f766e] shadow-sm sm:mt-3 sm:py-2">
                  {petState.title}
                </p>
              </div>
              <div className="p-4 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#0f766e] sm:text-sm">
                  {text.feeding}
                </p>
                <h2 className="mt-1.5 text-xl font-bold sm:mt-2 sm:text-3xl">
                  {latestFood ? `${text.fed}: ${latestFood.foodName}` : text.waiting}
                </h2>
                <p className="mt-2 text-base font-semibold leading-7 text-[#3b3430] sm:mt-3 sm:text-lg sm:leading-8">
                  {dialogue.message}
                </p>
                <p className="mt-2 rounded-lg bg-[#f8efe3] p-3 text-sm leading-6 text-[#665f56] sm:mt-3 sm:p-4 sm:leading-7">
                  {dialogue.reason}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#665f56] sm:mt-3 sm:leading-7">
                  {dialogue.suggestion}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#eadbc7] bg-white p-4 shadow-sm sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0f766e] sm:text-sm">
              {text.today}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3">
              <Metric label={text.records} value={String(total.records)} />
              <Metric
                label={text.calories}
                value={`${total.kcalMin}-${total.kcalMax}`}
                unit="kcal"
              />
              <Metric label={text.protein} value={String(total.protein)} unit="g" />
              <Metric label={text.carbs} value={String(total.carbs)} unit="g" />
              <Metric label={text.fat} value={String(total.fat)} unit="g" />
              <Metric label={text.state} value={petState.title} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-[#eadbc7] bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-bold sm:text-xl">{text.highlights}</h2>
            <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
              <Highlight
                label={text.highestCal}
                name={highlights.highestCalorie?.foodName}
                noneLabel={text.none}
                value={
                  highlights.highestCalorie
                    ? `${highlights.highestCalorie.kcalMin}-${highlights.highestCalorie.kcalMax} kcal`
                    : text.noData
                }
              />
              <Highlight
                label={text.highestProtein}
                name={highlights.highestProtein?.foodName}
                noneLabel={text.none}
                value={
                  highlights.highestProtein
                    ? `${highlights.highestProtein.protein}g protein`
                    : text.noData
                }
              />
              <Highlight
                label={text.assassin}
                name={highlights.calorieAssassin?.foodName}
                noneLabel={text.none}
                value={
                  highlights.calorieAssassin
                    ? `${highlights.calorieAssassin.kcalMax} kcal max`
                    : text.noData
                }
              />
            </div>
          </div>

          <div className="rounded-lg border border-[#eadbc7] bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-bold sm:text-xl">{text.timeline}</h2>
            <div className="mt-3 divide-y divide-[#f0e3d2] sm:mt-4">
              {foods.length === 0 ? (
                <div className="rounded-lg bg-[#f8efe3] p-4 text-sm text-[#766b60] sm:p-5">
                  {text.noCards}
                </div>
              ) : (
                foods.map((food) => (
                  <div
                    key={food.id}
                    className="flex items-center gap-2 py-2.5 sm:grid sm:grid-cols-[50px_58px_1fr_auto_auto] sm:gap-3 sm:py-3"
                  >
                    <div className="hidden text-sm font-semibold text-[#85786c] sm:block">
                      {food.time}
                    </div>
                    <FoodThumb src={food.imageUrl} name={food.foodName} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-sm sm:text-base">{food.foodName}</p>
                      <p className="mt-0.5 text-xs text-[#766b60] sm:text-sm">
                        <span className="sm:hidden">{food.time} · </span>
                        {food.portion} · {localizeMealType(food.mealType, language)} · {food.rarity}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-xs font-semibold text-[#0f766e] sm:text-sm">
                      {food.kcalMin}-{food.kcalMax}
                    </div>
                    <button
                      type="button"
                      aria-label={`${text.del} ${food.foodName}`}
                      onClick={() => handleDelete(food.id)}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e4d3be] bg-white text-[#766b60] sm:h-9 sm:w-9"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-lg bg-[#f8efe3] p-3 sm:p-4">
      <p className="text-xs font-medium text-[#766b60] sm:text-sm">{label}</p>
      <p className="mt-0.5 text-lg font-bold sm:mt-1 sm:text-2xl">
        {value}
        {unit ? <span className="ml-1 text-xs font-semibold sm:text-sm">{unit}</span> : null}
      </p>
    </div>
  );
}

function PetImage({ src, title }: { src: string; title: string }) {
  return (
    <div className="flex aspect-square w-full max-w-[160px] items-center justify-center rounded-lg bg-white/70 p-2 shadow-sm sm:max-w-[210px] sm:p-3">
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
      <div className="hidden text-center text-sm font-bold text-[#0f766e]">
        {title}
      </div>
    </div>
  );
}

function FoodThumb({ src, name }: { src: string; name: string }) {
  if (!src) {
    return (
      <div className="h-10 w-10 shrink-0 rounded-lg bg-[#f8efe3] sm:h-12 sm:w-12" aria-label={name} />
    );
  }

  return (
    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#f8efe3] sm:h-12 sm:w-12">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={name} className="h-full w-full object-cover" />
    </div>
  );
}

function Highlight({
  label,
  name,
  value,
  noneLabel = "None",
}: {
  label: string;
  name?: string;
  value: string;
  noneLabel?: string;
}) {
  return (
    <div className="rounded-lg bg-[#f8efe3] p-3 sm:p-4">
      <p className="text-xs font-medium text-[#766b60] sm:text-sm">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="truncate text-sm font-semibold sm:text-base">{name ?? noneLabel}</p>
        <p className="shrink-0 text-xs font-semibold text-[#0f766e] sm:text-sm">{value}</p>
      </div>
    </div>
  );
}
