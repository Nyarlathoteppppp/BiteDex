"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { SevenDayAnalysis, PetStatus } from "@/types"
import { getSevenDayAnalysis } from "@/lib/nutrition"
import { getDailyLogs } from "@/lib/storage"

const statusLabels: Record<PetStatus, string> = {
  normal: "😊 普通",
  energized: "💪 元气",
  chubby: "🫃 偏胖",
  tired: "😴 虚弱",
  sugar_rush: "🤪 糖分亢奋",
  overloaded: "🤯 过载",
}

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<SevenDayAnalysis | null>(null)

  useEffect(() => {
    const logs = getDailyLogs()
    setAnalysis(getSevenDayAnalysis(logs))
  }, [])

  if (!analysis) return null

  return (
    <main className="min-h-screen bg-[#fffaf3] text-[#231f20]">
      <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8">
        <header className="mb-6 flex items-center gap-3 border-b border-[#eadbc7] pb-4">
          <Link href="/" className="rounded-lg border border-[#e4d3be] bg-white p-2 hover:bg-gray-50">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#0f766e]">Analysis</p>
            <h1 className="text-xl font-bold">7 日分析</h1>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatTile label="记录天数" value={`${analysis.recordedDays} / 7`} />
          <StatTile label="总食物卡" value={String(analysis.foodCards)} />
          <StatTile label="日均热量" value={`${analysis.averageDailyKcalMin}–${analysis.averageDailyKcalMax}`} unit="kcal" />
          <StatTile
            label="最高热量日"
            value={analysis.highestCalorieDay?.date.slice(5) ?? "—"}
            sub={analysis.highestCalorieDay ? `${analysis.highestCalorieDay.kcalMax} kcal` : undefined}
          />
          <StatTile label="高糖天数" value={String(analysis.highSugarDays)} />
          <StatTile label="高脂天数" value={String(analysis.highFatDays)} />
          <StatTile label="高蛋白天数" value={String(analysis.highProteinDays)} />
          <StatTile label="过载天数" value={String(analysis.overloadedDays)} />
        </div>

        <section className="mt-6 rounded-xl border border-[#eadbc7] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">宠物状态分布</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(analysis.petStatusDistribution)
              .filter(([, count]) => count > 0)
              .map(([status, count]) => (
                <div key={status} className="rounded-lg bg-[#f8efe3] px-3 py-2">
                  <span className="text-sm">{statusLabels[status as PetStatus]}</span>
                  <span className="ml-2 font-bold text-[#0f766e]">{count}天</span>
                </div>
              ))}
            {Object.values(analysis.petStatusDistribution).every((v) => v === 0) && (
              <p className="text-sm text-[#85786c]">暂无数据</p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-[#0f766e]/20 bg-[#d9f3ea] p-5">
          <h3 className="font-bold text-[#0f766e]">周总结</h3>
          <p className="mt-2 text-sm text-[#3b3430]">{analysis.summary}</p>
          <h3 className="mt-4 font-bold text-[#0f766e]">建议</h3>
          <p className="mt-2 text-sm text-[#3b3430]">{analysis.advice}</p>
        </section>
      </div>
    </main>
  )
}

function StatTile({ label, value, unit, sub }: { label: string; value: string; unit?: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-[#eadbc7] bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-[#766b60]">{label}</p>
      <p className="mt-1 text-xl font-bold">
        {value}
        {unit && <span className="ml-1 text-xs font-semibold text-[#766b60]">{unit}</span>}
      </p>
      {sub && <p className="mt-0.5 text-xs text-[#85786c]">{sub}</p>}
    </div>
  )
}
