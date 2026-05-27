"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { DexItem } from "@/types"
import { getDex } from "@/lib/storage"

const rarityColors: Record<string, string> = {
  N: "bg-gray-100 text-gray-600",
  R: "bg-blue-50 text-blue-600",
  SR: "bg-purple-50 text-purple-600",
  SSR: "bg-amber-50 text-amber-600",
}

export default function DexPage() {
  const [entries, setEntries] = useState<DexItem[]>([])

  useEffect(() => {
    const dex = getDex()
    setEntries(Object.values(dex))
  }, [])

  return (
    <main className="min-h-screen bg-[#fffaf3] text-[#231f20]">
      <div className="mx-auto max-w-4xl px-5 py-6 sm:px-8">
        <header className="mb-6 flex items-center gap-3 border-b border-[#eadbc7] pb-4">
          <Link href="/" className="rounded-lg border border-[#e4d3be] bg-white p-2 hover:bg-gray-50">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#0f766e]">Collection</p>
            <h1 className="text-xl font-bold">食物图鉴</h1>
          </div>
          <span className="ml-auto rounded-full bg-[#f8efe3] px-3 py-1 text-sm font-semibold text-[#766b60]">
            {entries.length} 种
          </span>
        </header>

        {entries.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[#e4d3be] p-12 text-center">
            <p className="text-4xl">📖</p>
            <p className="mt-3 text-[#85786c]">还没有收集任何食物</p>
            <p className="mt-1 text-sm text-[#a89c8e]">去拍照识别，收集你的第一张卡吧！</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <div
                key={entry.foodName}
                className="overflow-hidden rounded-xl border border-[#eadbc7] bg-white shadow-sm"
              >
                <div className="h-32 overflow-hidden bg-[#f8efe3]">
                  {entry.imageUrl ? (
                    <img src={entry.imageUrl} alt={entry.foodName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl">🍽️</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-bold">{entry.foodName}</h3>
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-bold ${rarityColors[entry.rarity]}`}>
                      {entry.rarity}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#766b60]">
                    ×{entry.count} · {entry.avgKcalMin}–{entry.avgKcalMax} kcal
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full bg-[#f0e3d2] px-2 py-0.5 text-[11px] text-[#665f56]">
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
