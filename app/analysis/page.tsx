"use client"

import { useEffect, useState } from "react"
import { FoodCard, PetStatus } from "@/lib/types"
import { getAllLogs } from "@/lib/storage"
import { computePetState } from "@/lib/nutrition"

type DayStats = {
  date: string
  cards: FoodCard[]
  kcalMin: number
  kcalMax: number
  petStatus: PetStatus
}

export default function AnalysisPage() {
  const [stats, setStats] = useState<DayStats[]>([])

  useEffect(() => {
    const logs = getAllLogs()
    const now = new Date()
    const days: DayStats[] = []

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const cards = logs[key] || []
      const kcalMin = cards.reduce((s, c) => s + c.kcalMin, 0)
      const kcalMax = cards.reduce((s, c) => s + c.kcalMax, 0)
      const petStatus = computePetState(cards).status
      days.push({ date: key, cards, kcalMin, kcalMax, petStatus })
    }

    setStats(days)
  }, [])

  const activeDays = stats.filter((d) => d.cards.length > 0)
  const totalCards = stats.reduce((s, d) => s + d.cards.length, 0)
  const avgKcalMin = activeDays.length
    ? Math.round(activeDays.reduce((s, d) => s + d.kcalMin, 0) / activeDays.length)
    : 0
  const avgKcalMax = activeDays.length
    ? Math.round(activeDays.reduce((s, d) => s + d.kcalMax, 0) / activeDays.length)
    : 0
  const highestDay = stats.reduce(
    (max, d) => (d.kcalMin > max.kcalMin ? d : max),
    stats[0] || { date: "-", kcalMin: 0 }
  )
  const highSugarDays = stats.filter((d) =>
    d.cards.some((c) => c.tags.includes("high_sugar") || c.tags.includes("sweet"))
  ).length
  const highFatDays = stats.filter((d) =>
    d.cards.some((c) => c.tags.includes("high_fat"))
  ).length

  const statusCount: Partial<Record<PetStatus, number>> = {}
  stats.forEach((d) => {
    if (d.cards.length > 0) {
      statusCount[d.petStatus] = (statusCount[d.petStatus] || 0) + 1
    }
  })

  const statusLabels: Record<PetStatus, string> = {
    normal: "😊 普通",
    energized: "💪 元气",
    chubby: "🫃 偏胖",
    tired: "😴 虚弱",
    sugar_rush: "🤪 糖分亢奋",
    overloaded: "🤯 过载",
  }

  return (
    <main className="min-h-screen bg-[#fffaf3] px-4 py-6">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 text-center text-xl font-bold text-gray-800">7 日分析</h1>
        <p className="mb-6 text-center text-sm text-gray-400">
          近 7 天饮食数据总览
        </p>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <StatCard label="记录天数" value={`${activeDays.length} / 7`} />
          <StatCard label="总食物卡" value={`${totalCards}`} />
          <StatCard label="日均热量" value={`${avgKcalMin}–${avgKcalMax}`} unit="kcal" />
          <StatCard
            label="最高热量日"
            value={highestDay?.date?.slice(5) || "-"}
            sub={`${highestDay?.kcalMin || 0} kcal`}
          />
          <StatCard label="高糖天数" value={`${highSugarDays}`} />
          <StatCard label="高脂天数" value={`${highFatDays}`} />
        </div>

        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
            宠物状态分布
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(statusCount).map(([status, count]) => (
              <div
                key={status}
                className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-sm"
              >
                <span className="text-sm">{statusLabels[status as PetStatus]}</span>
                <span className="ml-2 font-bold text-teal-600">{count}天</span>
              </div>
            ))}
            {Object.keys(statusCount).length === 0 && (
              <p className="text-sm text-gray-400">暂无数据</p>
            )}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
            每日热量趋势
          </h2>
          <div className="flex items-end gap-1">
            {stats.map((d) => {
              const maxVal = Math.max(...stats.map((s) => s.kcalMax), 1)
              const height = d.kcalMax ? Math.max((d.kcalMax / maxVal) * 120, 8) : 8
              return (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      d.cards.length > 0 ? "bg-teal-400" : "bg-gray-200"
                    }`}
                    style={{ height: `${height}px` }}
                  />
                  <span className="text-[10px] text-gray-400">{d.date.slice(8)}</span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-xl border border-teal-100 bg-teal-50 p-4">
          <h3 className="font-semibold text-teal-800">总结建议</h3>
          <p className="mt-2 text-sm text-teal-700">
            {totalCards === 0
              ? "还没有足够的数据，开始记录饮食吧！"
              : avgKcalMin > 2200
                ? "近 7 天热量偏高，建议减少高热量食物摄入，多选择蔬菜和优质蛋白。"
                : avgKcalMax < 1200
                  ? "热量摄入偏低，注意均衡饮食，不要过度节食。"
                  : "饮食整体还不错！继续保持营养均衡的习惯。"}
          </p>
        </section>
      </div>
    </main>
  )
}

function StatCard({
  label,
  value,
  unit,
  sub,
}: {
  label: string
  value: string
  unit?: string
  sub?: string
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-800">
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-gray-400">{unit}</span>}
      </p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}
