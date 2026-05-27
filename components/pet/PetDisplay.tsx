"use client"

import { PetState, PetDialogue } from "@/lib/types"

export function PetDisplay({
  petState,
  dialogue,
}: {
  petState: PetState
  dialogue: PetDialogue
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="h-48 w-48 overflow-hidden rounded-full border-4 border-amber-200 bg-amber-50 shadow-lg">
          <img
            src={petState.imageUrl}
            alt={petState.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = "none"
              target.parentElement!.innerHTML = `<div class="flex h-full w-full items-center justify-center text-6xl">${getEmoji(petState.status)}</div>`
            }}
          />
        </div>
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-sm font-semibold shadow-md">
          {petState.title}
        </span>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
        <p className="text-center text-sm font-medium text-gray-800">
          {dialogue.message}
        </p>
        <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2">
          <p className="text-xs text-amber-700">💡 {dialogue.suggestion}</p>
        </div>
      </div>
    </div>
  )
}

function getEmoji(status: string): string {
  const map: Record<string, string> = {
    normal: "😊",
    energized: "💪",
    chubby: "🫃",
    tired: "😴",
    sugar_rush: "🤪",
    overloaded: "🤯",
  }
  return map[status] || "😊"
}
