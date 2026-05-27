"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Camera, ChartNoAxesCombined, LibraryBig, Trash2 } from "lucide-react"
import type { DailyLog } from "@/types"
import { buildDailyLog } from "@/lib/nutrition"
import { getTodayLog, deleteFoodCard } from "@/lib/storage"

export default function Home() {
  const [log, setLog] = useState<DailyLog>(buildDailyLog(new Date().toISOString().slice(0, 10), []))

  useEffect(() => {
    setLog(getTodayLog())
  }, [])

  function handleDelete(id: string) {
    const updated = deleteFoodCard(id, log.date)
    setLog(updated)
  }

  const { total, petState, dialogue, highlights, foods } = log

  return (
    <main className="min-h-screen bg-[#fffaf3] text-[#231f20]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-[#eadbc7] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#0f766e]">
              BiteDex MVP
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-normal">一口图鉴</h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            <Link
              href="/capture"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white shadow-sm"
            >
              <Camera size={18} /> 拍照
            </Link>
            <Link
              href="/dex"
              className="inline-flex items-center gap-2 rounded-lg border border-[#e4d3be] bg-white px-4 py-2 text-sm font-semibold"
            >
              <LibraryBig size={18} /> 图鉴
            </Link>
            <Link
              href="/analysis"
              className="inline-flex items-center gap-2 rounded-lg border border-[#e4d3be] bg-white px-4 py-2 text-sm font-semibold"
            >
              <ChartNoAxesCombined size={18} /> 分析
            </Link>
          </nav>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-[200px_1fr] sm:items-center">
              <div className="flex aspect-square items-center justify-center rounded-lg bg-[#d9f3ea]">
                <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[#0f766e]">
                  <img
                    src={petState.imageUrl}
                    alt={petState.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement
                      t.style.display = "none"
                      t.parentElement!.innerHTML = `<span class="text-4xl">${getEmoji(petState.status)}</span>`
                    }}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-[#0f766e]">
                  宠物状态
                </p>
                <h2 className="mt-2 text-2xl font-bold">{dialogue.title}</h2>
                <p className="mt-2 text-base font-semibold text-[#3b3430]">
                  {dialogue.message}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#665f56]">{dialogue.reason}</p>
                <p className="mt-1 text-sm leading-6 text-[#665f56]">💡 {dialogue.suggestion}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#0f766e]">
              今日摄入
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric label="记录数" value={String(total.records)} />
              <Metric label="热量" value={`${total.kcalMin}–${total.kcalMax}`} unit="kcal" />
              <Metric label="蛋白质" value={String(total.protein)} unit="g" />
              <Metric label="碳水" value={String(total.carbs)} unit="g" />
              <Metric label="脂肪" value={String(total.fat)} unit="g" />
              <Metric label="状态" value={petState.title} />
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold">今日亮点</h2>
            <div className="mt-4 space-y-3">
              <Highlight
                label="最高热量"
                name={highlights.highestCalorie?.foodName}
                value={
                  highlights.highestCalorie
                    ? `${highlights.highestCalorie.kcalMin}–${highlights.highestCalorie.kcalMax} kcal`
                    : "暂无"
                }
              />
              <Highlight
                label="最高蛋白"
                name={highlights.highestProtein?.foodName}
                value={
                  highlights.highestProtein
                    ? `${highlights.highestProtein.protein}g`
                    : "暂无"
                }
              />
              <Highlight
                label="热量刺客"
                name={highlights.calorieAssassin?.foodName}
                value={
                  highlights.calorieAssassin
                    ? `${highlights.calorieAssassin.kcalMax} kcal`
                    : "暂无"
                }
              />
            </div>
          </div>

          <div className="rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold">今日时间线</h2>
            {foods.length === 0 ? (
              <div className="mt-4 rounded-lg border-2 border-dashed border-[#e4d3be] p-8 text-center">
                <p className="text-[#85786c]">还没有记录</p>
                <p className="mt-1 text-sm text-[#a89c8e]">拍一张食物开始吧！</p>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-[#f0e3d2]">
                {foods.map((food) => (
                  <div
                    key={food.id}
                    className="grid grid-cols-[50px_1fr_auto_32px] items-center gap-3 py-3"
                  >
                    <div className="text-sm font-semibold text-[#85786c]">{food.time}</div>
                    <div>
                      <p className="font-semibold">{food.foodName}</p>
                      <p className="mt-0.5 text-sm text-[#766b60]">
                        {food.portion} · {food.mealType} · <span className="font-bold">{food.rarity}</span>
                      </p>
                    </div>
                    <div className="text-right text-sm font-semibold text-[#0f766e]">
                      {food.kcalMin}–{food.kcalMax}
                    </div>
                    <button
                      onClick={() => handleDelete(food.id)}
                      className="rounded p-1 text-[#a89c8e] hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function Metric({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-lg bg-[#f8efe3] p-4">
      <p className="text-sm font-medium text-[#766b60]">{label}</p>
      <p className="mt-1 text-2xl font-bold">
        {value}
        {unit ? <span className="ml-1 text-sm font-semibold text-[#766b60]">{unit}</span> : null}
      </p>
    </div>
  )
}

function Highlight({ label, name, value }: { label: string; name?: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#f8efe3] p-4">
      <p className="text-sm font-medium text-[#766b60]">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="font-semibold">{name ?? "—"}</p>
        <p className="text-sm font-semibold text-[#0f766e]">{value}</p>
      </div>
    </div>
  )
}

function getEmoji(status: string): string {
  const map: Record<string, string> = {
    normal: "😊", energized: "💪", chubby: "🫃",
    tired: "😴", sugar_rush: "🤪", overloaded: "🤯",
  }
  return map[status] || "😊"
}
