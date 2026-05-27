"use client"

import { FoodCard, DexEntry, Rarity } from "./types"

const DAILY_LOGS_KEY = "bitedex.dailyLogs.v1"
const DEX_KEY = "bitedex.dex.v1"

function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getAllLogs(): Record<string, FoodCard[]> {
  if (typeof window === "undefined") return {}
  const raw = localStorage.getItem(DAILY_LOGS_KEY)
  return raw ? JSON.parse(raw) : {}
}

export function getTodayCards(): FoodCard[] {
  const logs = getAllLogs()
  return logs[getToday()] || []
}

export function addFoodCard(card: FoodCard): void {
  const logs = getAllLogs()
  const today = getToday()
  if (!logs[today]) logs[today] = []
  logs[today].push(card)
  localStorage.setItem(DAILY_LOGS_KEY, JSON.stringify(logs))
  updateDex(card)
}

export function deleteFoodCard(cardId: string): void {
  const logs = getAllLogs()
  const today = getToday()
  if (logs[today]) {
    logs[today] = logs[today].filter((c) => c.id !== cardId)
    localStorage.setItem(DAILY_LOGS_KEY, JSON.stringify(logs))
  }
}

export function getDex(): DexEntry[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(DEX_KEY)
  return raw ? JSON.parse(raw) : []
}

function rarityRank(r: Rarity): number {
  const ranks: Record<Rarity, number> = { N: 0, R: 1, SR: 2, SSR: 3 }
  return ranks[r]
}

function updateDex(card: FoodCard): void {
  const dex = getDex()
  const existing = dex.find(
    (e) => e.foodName.toLowerCase() === card.foodName.toLowerCase()
  )
  if (existing) {
    existing.count += 1
    existing.avgKcalMin = Math.round(
      (existing.avgKcalMin * (existing.count - 1) + card.kcalMin) / existing.count
    )
    existing.avgKcalMax = Math.round(
      (existing.avgKcalMax * (existing.count - 1) + card.kcalMax) / existing.count
    )
    if (rarityRank(card.rarity) > rarityRank(existing.bestRarity)) {
      existing.bestRarity = card.rarity
    }
    existing.tags = Array.from(new Set([...existing.tags, ...card.tags]))
    existing.lastImageUrl = card.imageUrl
  } else {
    dex.push({
      foodName: card.foodName,
      count: 1,
      avgKcalMin: card.kcalMin,
      avgKcalMax: card.kcalMax,
      bestRarity: card.rarity,
      tags: [...card.tags],
      lastImageUrl: card.imageUrl,
    })
  }
  localStorage.setItem(DEX_KEY, JSON.stringify(dex))
}

export function getRecentDaysCards(days: number): FoodCard[] {
  const logs = getAllLogs()
  const result: FoodCard[] = []
  const now = new Date()
  for (let i = 0; i < days; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (logs[key]) result.push(...logs[key])
  }
  return result
}
