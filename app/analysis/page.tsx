"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Camera, ChartNoAxesCombined } from "lucide-react";
import type { PetStatus, SevenDayAnalysis } from "@/types";
import { getSevenDayAnalysis } from "@/lib/nutrition";
import { getDailyLogs } from "@/lib/storage";
import { localizePetStatus, useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/app/components/language-toggle";

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<SevenDayAnalysis | null>(null);
  const { language, setLanguage } = useLanguage("zh");

  useEffect(() => {
    setAnalysis(getSevenDayAnalysis(getDailyLogs(), new Date(), language));
  }, [language]);
  const text = language === "zh"
    ? {
        loading: "分析加载中...",
        dashboard: "首页",
        title: "7 日分析",
        upload: "拍照",
        recordedDays: "记录天数",
        foodCards: "食物卡",
        avgCalories: "平均热量",
        overloadDays: "过载天数",
        noTrend: "暂无趋势",
        noTrendDesc: "至少记录一张食物卡，才能生成你的周度分析。",
        weeklySignals: "本周信号",
        highSugar: "高糖天数",
        highFat: "高脂天数",
        highProtein: "高蛋白天数",
        highestDay: "最高日",
        lowestDay: "最低日",
        petDist: "宠物状态分布",
        noPetStates: "还没有宠物状态记录。",
        day: "天",
        summary: "总结",
      }
    : {
        loading: "Loading analysis...",
        dashboard: "Dashboard",
        title: "7-Day Analysis",
        upload: "Upload",
        recordedDays: "Recorded Days",
        foodCards: "Food Cards",
        avgCalories: "Avg Calories",
        overloadDays: "Overload Days",
        noTrend: "No trend yet",
        noTrendDesc: "Record at least one food card to generate your weekly BiteDex analysis.",
        weeklySignals: "Weekly Signals",
        highSugar: "High Sugar",
        highFat: "High Fat",
        highProtein: "High Protein",
        highestDay: "Highest Day",
        lowestDay: "Lowest Day",
        petDist: "Pet State Distribution",
        noPetStates: "No pet states recorded yet.",
        day: "day",
        summary: "Summary",
      };


  const statusRows = useMemo(() => {
    if (!analysis) {
      return [];
    }

    return Object.entries(analysis.petStatusDistribution).filter(
      ([, count]) => count > 0,
    );
  }, [analysis]);

  if (!analysis) {
    return (
      <main className="min-h-screen bg-[#fffaf3] px-4 py-5 text-[#231f20]">
        <div className="mx-auto max-w-6xl rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
          {text.loading}
        </div>
      </main>
    );
  }

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
          <div className="flex items-center gap-2">
            <LanguageToggle language={language} onChange={setLanguage} />
            <Link
              href="/capture"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0f766e] px-3 py-2 text-xs font-semibold text-white shadow-sm sm:gap-2 sm:px-4 sm:text-sm"
            >
              <Camera size={16} />
              {text.upload}
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Metric label={text.recordedDays} value={analysis.recordedDays} />
          <Metric label={text.foodCards} value={analysis.foodCards} />
          <Metric
            label={text.avgCalories}
            value={`${analysis.averageDailyKcalMin}-${analysis.averageDailyKcalMax}`}
            unit="kcal"
          />
          <Metric label={text.overloadDays} value={analysis.overloadedDays} />
        </section>

        {analysis.recordedDays === 0 ? (
          <section className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-[#eadbc7] bg-white p-6 text-center shadow-sm sm:min-h-[360px] sm:p-8">
            <ChartNoAxesCombined size={36} className="text-[#0f766e]" />
            <h2 className="mt-3 text-xl font-bold sm:mt-4 sm:text-2xl">{text.noTrend}</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#665f56] sm:leading-7">
              {text.noTrendDesc}
            </p>
          </section>
        ) : (
          <>
            <section className="grid gap-4 sm:gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border border-[#eadbc7] bg-white p-4 shadow-sm sm:p-5">
                <h2 className="text-lg font-bold sm:text-xl">{text.weeklySignals}</h2>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
                  <Signal label={text.highSugar} value={analysis.highSugarDays} />
                  <Signal label={text.highFat} value={analysis.highFatDays} />
                  <Signal label={text.highProtein} value={analysis.highProteinDays} />
                  <Signal
                    label={text.highestDay}
                    value={
                      analysis.highestCalorieDay
                        ? `${analysis.highestCalorieDay.kcalMax}`
                        : "—"
                    }
                    sub={analysis.highestCalorieDay?.date.slice(5)}
                  />
                  <Signal
                    label={text.lowestDay}
                    value={
                      analysis.lowestCalorieDay
                        ? `${analysis.lowestCalorieDay.kcalMin}`
                        : "—"
                    }
                    sub={analysis.lowestCalorieDay?.date.slice(5)}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-[#eadbc7] bg-white p-4 shadow-sm sm:p-5">
                <h2 className="text-lg font-bold sm:text-xl">{text.petDist}</h2>
                <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
                  {statusRows.length === 0 ? (
                    <p className="rounded-lg bg-[#f8efe3] p-3 text-sm text-[#766b60] sm:p-4">
                      {text.noPetStates}
                    </p>
                  ) : (
                    statusRows.map(([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center justify-between rounded-lg bg-[#f8efe3] p-3 sm:p-4"
                      >
                        <p className="text-sm font-semibold sm:text-base">{localizePetStatus(status as PetStatus, language)}</p>
                        <p className="text-xs font-bold text-[#0f766e] sm:text-sm">
                          {count} {text.day}{language === "zh" ? "" : count === 1 ? "" : "s"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-[#eadbc7] bg-white p-4 shadow-sm sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#0f766e] sm:text-sm">
                {text.summary}
              </p>
              <h2 className="mt-1.5 text-lg font-bold sm:mt-2 sm:text-2xl">{analysis.summary}</h2>
              <p className="mt-2 text-sm leading-6 text-[#665f56] sm:mt-3 sm:leading-7">{analysis.advice}</p>
            </section>
          </>
        )}
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
  value: number | string;
  unit?: string;
}) {
  return (
    <div className="rounded-lg border border-[#eadbc7] bg-white p-3 shadow-sm sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0f766e] sm:text-sm">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold sm:mt-2 sm:text-3xl">
        {value}
        {unit ? <span className="ml-1 text-[10px] font-semibold sm:text-sm">{unit}</span> : null}
      </p>
    </div>
  );
}

function Signal({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-lg bg-[#f8efe3] p-2.5 sm:p-4">
      <p className="text-[11px] font-medium text-[#766b60] sm:text-sm">{label}</p>
      <p className="mt-0.5 text-sm font-bold sm:mt-1 sm:text-base">{value}</p>
      {sub && <p className="text-[10px] text-[#85786c] sm:text-xs">{sub}</p>}
    </div>
  );
}

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}
