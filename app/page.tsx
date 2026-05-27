"use client"

import { useEffect, useState } from "react"
import { FoodCard, PetState, PetDialogue } from "@/lib/types"
import { computePetState, generatePetDialogue, getTodayNutrition } from "@/lib/nutrition"
import { getTodayCards, deleteFoodCard } from "@/lib/storage"
import { PetDisplay } from "@/components/pet/PetDisplay"
import { FoodCardComponent } from "@/components/food/FoodCardComponent"
import { Camera } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [cards, setCards] = useState<FoodCard[]>([])
  const [petState, setPetState] = useState<PetState>({
    status: "normal",
    title: "心情不错~",
    imageUrl: "/pets/normal.svg",
  })
  const [dialogue, setDialogue] = useState<PetDialogue>(generatePetDialogue("normal"))

  useEffect(() => {
    refreshData()
  }, [])

  function refreshData() {
    const todayCards = getTodayCards()
    setCards(todayCards)
    const state = computePetState(todayCards)
    setPetState(state)
    setDialogue(generatePetDialogue(state.status))
  }

  function handleDelete(id: string) {
    deleteFoodCard(id)
    refreshData()
  }

  const nutrition = getTodayNutrition(cards)

  return (
    <main className="min-h-screen bg-[#fffaf3] px-4 py-6">
      <div className="mx-auto max-w-lg">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">BiteDex</h1>
          <p className="text-sm text-gray-500">一口图鉴</p>
        </header>

        <section className="mb-8">
          <PetDisplay petState={petState} dialogue={dialogue} />
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
            今日营养摄入
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-orange-100 bg-white p-3 shadow-sm">
              <p className="text-xs text-gray-500">热量</p>
              <p className="text-xl font-bold text-orange-600">
                {nutrition.totalKcalMin}–{nutrition.totalKcalMax}
              </p>
              <p className="text-xs text-gray-400">kcal</p>
            </div>
            <div className="rounded-xl border border-red-100 bg-white p-3 shadow-sm">
              <p className="text-xs text-gray-500">蛋白质</p>
              <p className="text-xl font-bold text-red-600">{nutrition.totalProtein}g</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-white p-3 shadow-sm">
              <p className="text-xs text-gray-500">碳水化合物</p>
              <p className="text-xl font-bold text-blue-600">{nutrition.totalCarbs}g</p>
            </div>
            <div className="rounded-xl border border-yellow-100 bg-white p-3 shadow-sm">
              <p className="text-xs text-gray-500">脂肪</p>
              <p className="text-xl font-bold text-yellow-600">{nutrition.totalFat}g</p>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              今日时间线
            </h2>
            <span className="text-xs text-gray-400">{cards.length} 条记录</span>
          </div>

          {cards.length === 0 ? (
            <div className="mt-4 rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
              <p className="text-gray-400">还没有记录</p>
              <p className="mt-1 text-sm text-gray-300">拍一张食物开始吧！</p>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {cards
                .slice()
                .reverse()
                .map((card) => (
                  <FoodCardComponent
                    key={card.id}
                    card={card}
                    onDelete={handleDelete}
                    compact
                  />
                ))}
            </div>
          )}
        </section>

        <Link
          href="/capture"
          className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 active:scale-95 transition-transform"
        >
          <Camera size={24} />
        </Link>
      </div>
    </main>
  )
}
