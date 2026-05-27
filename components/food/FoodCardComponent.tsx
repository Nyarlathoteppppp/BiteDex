"use client"

import { FoodCard, Rarity } from "@/lib/types"
import { Trash2 } from "lucide-react"

const rarityColors: Record<Rarity, string> = {
  N: "bg-gray-100 text-gray-600 border-gray-200",
  R: "bg-blue-50 text-blue-600 border-blue-200",
  SR: "bg-purple-50 text-purple-600 border-purple-200",
  SSR: "bg-amber-50 text-amber-600 border-amber-200",
}

const rarityBorder: Record<Rarity, string> = {
  N: "border-gray-200",
  R: "border-blue-200",
  SR: "border-purple-300",
  SSR: "border-amber-400 shadow-amber-100",
}

export function FoodCardComponent({
  card,
  onDelete,
  compact,
}: {
  card: FoodCard
  onDelete?: (id: string) => void
  compact?: boolean
}) {
  if (compact) {
    return (
      <div className={`flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm ${rarityBorder[card.rarity]}`}>
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
          {card.imageUrl ? (
            <img src={card.imageUrl} alt={card.foodName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg">🍽️</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold">{card.foodName}</span>
            <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${rarityColors[card.rarity]}`}>
              {card.rarity}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {card.time} · {card.kcalMin}–{card.kcalMax} kcal
          </p>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(card.id)}
            className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${rarityBorder[card.rarity]}`}>
      {card.imageUrl && (
        <div className="h-40 w-full overflow-hidden bg-gray-100">
          <img src={card.imageUrl} alt={card.foodName} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">{card.foodName}</h3>
              <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${rarityColors[card.rarity]}`}>
                {card.rarity}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">{card.portion} · {card.mealType}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-teal-600">{card.biteScore}</p>
            <p className="text-xs text-gray-400">Bite Score</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-orange-50 px-2 py-1.5">
            <p className="text-xs text-gray-500">热量</p>
            <p className="text-sm font-semibold text-orange-600">
              {card.kcalMin}–{card.kcalMax}
            </p>
          </div>
          <div className="rounded-lg bg-red-50 px-2 py-1.5">
            <p className="text-xs text-gray-500">蛋白质</p>
            <p className="text-sm font-semibold text-red-600">{card.protein}g</p>
          </div>
          <div className="rounded-lg bg-blue-50 px-2 py-1.5">
            <p className="text-xs text-gray-500">碳水</p>
            <p className="text-sm font-semibold text-blue-600">{card.carbs}g</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {card.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {tag}
            </span>
          ))}
        </div>

        <p className="mt-3 text-sm text-gray-600 italic">{card.advice}</p>

        {onDelete && (
          <button
            onClick={() => onDelete(card.id)}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-red-200 py-2 text-sm text-red-500 hover:bg-red-50"
          >
            <Trash2 size={14} />
            删除记录
          </button>
        )}
      </div>
    </div>
  )
}
