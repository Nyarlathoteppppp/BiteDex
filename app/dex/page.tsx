"use client"

import { useEffect, useState } from "react"
import { DexEntry } from "@/lib/types"
import { getDex } from "@/lib/storage"

const rarityColors = {
  N: "bg-gray-100 text-gray-600",
  R: "bg-blue-50 text-blue-600",
  SR: "bg-purple-50 text-purple-600",
  SSR: "bg-amber-50 text-amber-600",
}

export default function DexPage() {
  const [entries, setEntries] = useState<DexEntry[]>([])

  useEffect(() => {
    setEntries(getDex())
  }, [])

  return (
    <main className="min-h-screen bg-[#fffaf3] px-4 py-6">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 text-center text-xl font-bold text-gray-800">食物图鉴</h1>
        <p className="mb-6 text-center text-sm text-gray-400">
          已收集 {entries.length} 种食物
        </p>

        {entries.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <p className="text-4xl">📖</p>
            <p className="mt-3 text-gray-400">还没有收集任何食物</p>
            <p className="mt-1 text-sm text-gray-300">去拍照识别，收集你的第一张卡吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {entries.map((entry) => (
              <div
                key={entry.foodName}
                className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="h-28 overflow-hidden bg-gray-100">
                  {entry.lastImageUrl ? (
                    <img
                      src={entry.lastImageUrl}
                      alt={entry.foodName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl">
                      🍽️
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold">{entry.foodName}</span>
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-bold ${rarityColors[entry.bestRarity]}`}>
                      {entry.bestRarity}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    ×{entry.count} · {entry.avgKcalMin}–{entry.avgKcalMax} kcal
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
