import type {
  DailyHighlights,
  DailyLog,
  DailyLogsByDate,
  DailyTotal,
  DexItem,
  FoodCard,
  FoodTag,
  PetDialogue,
  PetState,
  PetStatus,
  PetStatusDistribution,
  Rarity,
  SevenDayAnalysis,
} from "@/types"

const sugarTags = new Set<FoodTag>(["high_sugar", "sweet", "dessert", "drink"])
const fatTags = new Set<FoodTag>(["high_fat", "fried", "creamy"])

const rarityRank: Record<Rarity, number> = { N: 0, R: 1, SR: 2, SSR: 3 }

const petImageByStatus: Record<PetStatus, string> = {
  normal: "/pets/normal.svg",
  energized: "/pets/energized.svg",
  chubby: "/pets/chubby.svg",
  tired: "/pets/tired.svg",
  sugar_rush: "/pets/sugar-rush.svg",
  overloaded: "/pets/overloaded.svg",
}

const petTitleByStatus: Record<PetStatus, string> = {
  normal: "心情不错~",
  energized: "元气满满！",
  chubby: "吃太多啦...",
  tired: "有点饿...",
  sugar_rush: "糖分超标！",
  overloaded: "热量爆炸！！",
}

export function calculateDailyTotal(foods: FoodCard[]): DailyTotal {
  return foods.reduce<DailyTotal>(
    (total, food) => ({
      records: total.records + 1,
      kcalMin: total.kcalMin + food.kcalMin,
      kcalMax: total.kcalMax + food.kcalMax,
      protein: total.protein + food.protein,
      carbs: total.carbs + food.carbs,
      fat: total.fat + food.fat,
    }),
    { records: 0, kcalMin: 0, kcalMax: 0, protein: 0, carbs: 0, fat: 0 },
  )
}

export function computeRarity(food: { kcalMax: number; tags: FoodTag[] }): Rarity {
  let rarity: Rarity = "N"
  if (food.kcalMax >= 900) rarity = "SSR"
  else if (food.kcalMax >= 600) rarity = "SR"
  else if (food.kcalMax >= 300) rarity = "R"

  if (food.tags.some((tag) => sugarTags.has(tag) || fatTags.has(tag))) {
    return upgradeRarity(rarity)
  }
  return rarity
}

export function computePetState(foods: FoodCard[]): PetState {
  const total = calculateDailyTotal(foods)
  const highSugarCount = foods.filter(isHighSugarFood).length
  const highFatCount = foods.filter(isHighFatFood).length

  let status: PetStatus = "normal"

  if (total.kcalMin > 2800) {
    status = "overloaded"
  } else if (highSugarCount >= 2) {
    status = "sugar_rush"
  } else if (total.records >= 2 && total.kcalMax < 1000) {
    status = "tired"
  } else if (total.kcalMin > 2200 || highFatCount >= 2) {
    status = "chubby"
  } else if (total.kcalMin >= 1200 && total.kcalMin <= 2200 && total.protein >= 60) {
    status = "energized"
  }

  return {
    status,
    title: petTitleByStatus[status],
    imageUrl: petImageByStatus[status],
  }
}

export function generatePetDialogue(petState: PetState, foods: FoodCard[]): PetDialogue {
  const total = calculateDailyTotal(foods)
  const highSugarCount = foods.filter(isHighSugarFood).length
  const highFatCount = foods.filter(isHighFatFood).length

  if (foods.length === 0) {
    return {
      title: "等待中",
      message: "今天还没怎么吃呢，期待你的美食分享~",
      reason: "还没有记录任何食物",
      suggestion: "拍一张食物开始今天的 BiteDex 吧！",
    }
  }

  if (petState.status === "overloaded") {
    return {
      title: "热量过载",
      message: "今天真的吃太多了！需要休息一下...",
      reason: `今日热量已达 ${total.kcalMin}–${total.kcalMax} kcal`,
      suggestion: "明天试试清淡饮食，少油少炸少大份",
    }
  }

  if (petState.status === "sugar_rush") {
    return {
      title: "糖分亢奋",
      message: "甜甜甜！糖分摄入有点高啦！",
      reason: `今天高糖食物已经有 ${highSugarCount} 个`,
      suggestion: "接下来选择无糖饮品，多搭配蛋白质和蔬菜",
    }
  }

  if (petState.status === "tired") {
    return {
      title: "有点虚",
      message: "吃得太少了，感觉没什么力气...",
      reason: "记录了多餐但总热量偏低",
      suggestion: "适当补充优质蛋白、主食和蔬菜",
    }
  }

  if (petState.status === "chubby") {
    return {
      title: "有点撑",
      message: "今天吃得有点多了...肚子圆滚滚的",
      reason: `热量偏高或高脂食物较多（高脂 ${highFatCount} 个）`,
      suggestion: "下一餐选择清淡食物，少油少炸多蔬菜",
    }
  }

  if (petState.status === "energized") {
    return {
      title: "元气满满",
      message: "营养均衡，蛋白质充足，今天状态超好！",
      reason: `蛋白质达到 ${total.protein}g，热量在合理范围`,
      suggestion: "继续保持这个均衡模式，避免额外甜饮",
    }
  }

  return {
    title: "普通状态",
    message: "今天还算稳定~",
    reason: "目前的饮食还没有触发特殊状态",
    suggestion: "继续记录饮食，让我更了解你的模式",
  }
}

export function computeHighlights(foods: FoodCard[]): DailyHighlights {
  return {
    highestCalorie: maxBy(foods, (f) => f.kcalMax),
    highestProtein: maxBy(foods, (f) => f.protein),
    calorieAssassin: maxBy(
      foods.filter((f) => f.kcalMax >= 300 && f.protein < 10),
      (f) => f.kcalMax,
    ),
  }
}

export function buildDailyLog(date: string, foods: FoodCard[]): DailyLog {
  const petState = computePetState(foods)
  return {
    date,
    foods,
    total: calculateDailyTotal(foods),
    highlights: computeHighlights(foods),
    petState,
    dialogue: generatePetDialogue(petState, foods),
  }
}

export function mergeDexItem(current: DexItem | undefined, food: FoodCard): DexItem {
  if (!current) {
    return {
      foodName: food.foodName,
      firstSeenAt: food.createdAt,
      lastSeenAt: food.createdAt,
      count: 1,
      imageUrl: food.imageUrl,
      tags: food.tags,
      rarity: food.rarity,
      avgKcalMin: food.kcalMin,
      avgKcalMax: food.kcalMax,
    }
  }

  const count = current.count + 1
  return {
    ...current,
    lastSeenAt: food.createdAt,
    count,
    imageUrl: food.imageUrl || current.imageUrl,
    tags: mergeTags(current.tags, food.tags),
    rarity: rarityRank[food.rarity] > rarityRank[current.rarity] ? food.rarity : current.rarity,
    avgKcalMin: Math.round((current.avgKcalMin * current.count + food.kcalMin) / count),
    avgKcalMax: Math.round((current.avgKcalMax * current.count + food.kcalMax) / count),
  }
}

export function getSevenDayAnalysis(
  logsByDate: DailyLogsByDate,
  today = new Date(),
): SevenDayAnalysis {
  const dates = getRecentDateKeys(today, 7)
  const logs = dates.map((d) => logsByDate[d]).filter(Boolean)
  const totals = logs.map((log) => log.total)
  const foodCards = totals.reduce((sum, t) => sum + t.records, 0)
  const recordedDays = logs.length
  const kcalMinSum = totals.reduce((sum, t) => sum + t.kcalMin, 0)
  const kcalMaxSum = totals.reduce((sum, t) => sum + t.kcalMax, 0)
  const highSugarDays = logs.filter((log) => log.foods.some(isHighSugarFood)).length
  const highFatDays = logs.filter((log) => log.foods.some(isHighFatFood)).length
  const highProteinDays = logs.filter((log) => log.total.protein >= 60).length
  const overloadedDays = logs.filter((log) => log.petState.status === "overloaded").length

  return {
    recordedDays,
    foodCards,
    averageDailyKcalMin: recordedDays ? Math.round(kcalMinSum / recordedDays) : 0,
    averageDailyKcalMax: recordedDays ? Math.round(kcalMaxSum / recordedDays) : 0,
    highestCalorieDay: maxBy(logs, (l) => l.total.kcalMax)
      ? { date: maxBy(logs, (l) => l.total.kcalMax)!.date, kcalMax: maxBy(logs, (l) => l.total.kcalMax)!.total.kcalMax }
      : undefined,
    lowestCalorieDay: minBy(logs, (l) => l.total.kcalMin)
      ? { date: minBy(logs, (l) => l.total.kcalMin)!.date, kcalMin: minBy(logs, (l) => l.total.kcalMin)!.total.kcalMin }
      : undefined,
    highSugarDays,
    highFatDays,
    highProteinDays,
    overloadedDays,
    petStatusDistribution: computePetStatusDistribution(logs),
    summary: buildWeeklySummary(recordedDays, highSugarDays, highFatDays, overloadedDays),
    advice: buildWeeklyAdvice(highSugarDays, highFatDays, overloadedDays),
  }
}

function isHighSugarFood(food: FoodCard): boolean {
  return food.tags.some((tag) => sugarTags.has(tag))
}

function isHighFatFood(food: FoodCard): boolean {
  return food.fat >= 25 || food.tags.some((tag) => fatTags.has(tag))
}

function upgradeRarity(rarity: Rarity): Rarity {
  if (rarity === "N") return "R"
  if (rarity === "R") return "SR"
  if (rarity === "SR") return "SSR"
  return "SSR"
}

function mergeTags(left: FoodTag[], right: FoodTag[]): FoodTag[] {
  return Array.from(new Set([...left, ...right]))
}

function maxBy<T>(items: T[], getValue: (item: T) => number): T | undefined {
  return items.reduce<T | undefined>((best, item) => {
    if (!best || getValue(item) > getValue(best)) return item
    return best
  }, undefined)
}

function minBy<T>(items: T[], getValue: (item: T) => number): T | undefined {
  return items.reduce<T | undefined>((best, item) => {
    if (!best || getValue(item) < getValue(best)) return item
    return best
  }, undefined)
}

function getRecentDateKeys(today: Date, days: number): string[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    return d.toISOString().slice(0, 10)
  })
}

function computePetStatusDistribution(logs: DailyLog[]): PetStatusDistribution {
  const init: PetStatusDistribution = {
    normal: 0, energized: 0, chubby: 0, tired: 0, sugar_rush: 0, overloaded: 0,
  }
  return logs.reduce<PetStatusDistribution>((dist, log) => {
    dist[log.petState.status] += 1
    return dist
  }, init)
}

function buildWeeklySummary(
  recordedDays: number,
  highSugarDays: number,
  highFatDays: number,
  overloadedDays: number,
): string {
  if (recordedDays === 0) return "近 7 天没有记录数据"
  if (overloadedDays > 0) return "近 7 天至少有一天热量过载"
  if (highSugarDays >= 3) return "这周甜食出现得比较频繁"
  if (highFatDays >= 3) return "这周高脂食物出现较多"
  return "这周饮食整体比较稳定"
}

function buildWeeklyAdvice(
  highSugarDays: number,
  highFatDays: number,
  overloadedDays: number,
): string {
  if (overloadedDays > 0) return "先减少大份量餐食，再调整零食和甜饮"
  if (highSugarDays >= highFatDays && highSugarDays > 0) return "减少甜饮比削减主食更容易改善周数据"
  if (highFatDays > 0) return "尝试用烤/蒸代替油炸，搭配更多蔬菜"
  return "继续坚持记录，数据越多趋势越清晰"
}
