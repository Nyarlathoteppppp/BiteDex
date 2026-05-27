import { FoodCard, PetStatus, PetState, PetDialogue } from "./types"

const petImages: Record<PetStatus, string> = {
  normal: "/pets/normal.svg",
  energized: "/pets/energized.svg",
  chubby: "/pets/chubby.svg",
  tired: "/pets/tired.svg",
  sugar_rush: "/pets/sugar-rush.svg",
  overloaded: "/pets/overloaded.svg",
}

const petTitles: Record<PetStatus, string> = {
  normal: "心情不错~",
  energized: "元气满满！",
  chubby: "吃太多啦...",
  tired: "有点饿...",
  sugar_rush: "糖分超标！",
  overloaded: "热量爆炸！！",
}

export function computePetState(todayCards: FoodCard[]): PetState {
  if (todayCards.length === 0) {
    return { status: "normal", title: petTitles.normal, imageUrl: petImages.normal }
  }

  const totalKcalMin = todayCards.reduce((sum, c) => sum + c.kcalMin, 0)
  const totalKcalMax = todayCards.reduce((sum, c) => sum + c.kcalMax, 0)
  const totalProtein = todayCards.reduce((sum, c) => sum + c.protein, 0)
  const highSugarCount = todayCards.filter((c) =>
    c.tags.includes("high_sugar") || c.tags.includes("sweet")
  ).length
  const highFatCount = todayCards.filter((c) => c.tags.includes("high_fat")).length

  let status: PetStatus = "normal"

  if (totalKcalMin > 2800) {
    status = "overloaded"
  } else if (highSugarCount >= 2) {
    status = "sugar_rush"
  } else if (todayCards.length >= 2 && totalKcalMax < 1000) {
    status = "tired"
  } else if (totalKcalMin > 2200 || highFatCount >= 2) {
    status = "chubby"
  } else if (totalKcalMin >= 1200 && totalKcalMin <= 2200 && totalProtein >= 60) {
    status = "energized"
  }

  return { status, title: petTitles[status], imageUrl: petImages[status] }
}

const dialogues: Record<PetStatus, PetDialogue> = {
  normal: {
    title: "普通状态",
    message: "今天还没怎么吃呢，期待你的美食分享~",
    reason: "还没有足够的记录来判断状态",
    suggestion: "记得按时吃饭哦！",
  },
  energized: {
    title: "元气满满",
    message: "营养均衡，蛋白质充足，今天状态超好！",
    reason: "热量适中，蛋白质摄入达标",
    suggestion: "继续保持这样的饮食习惯！",
  },
  chubby: {
    title: "有点撑",
    message: "今天吃得有点多了...肚子圆滚滚的",
    reason: "热量超过2200kcal或高脂食物较多",
    suggestion: "下一餐可以选择清淡一些的食物",
  },
  tired: {
    title: "有点虚",
    message: "吃得太少了，感觉没什么力气...",
    reason: "记录了多餐但总热量不足1000kcal",
    suggestion: "适当补充一些优质蛋白和碳水",
  },
  sugar_rush: {
    title: "糖分亢奋",
    message: "甜甜甜！糖分摄入有点高啦！",
    reason: "今天高糖食物已经有2个以上",
    suggestion: "接下来尽量避免甜食，多喝水",
  },
  overloaded: {
    title: "热量过载",
    message: "今天真的吃太多了！需要休息一下...",
    reason: "今日热量已超过2800kcal",
    suggestion: "今天不要再加餐了，明天清淡饮食",
  },
}

export function generatePetDialogue(status: PetStatus): PetDialogue {
  return dialogues[status]
}

export function computeRarity(biteScore: number): "N" | "R" | "SR" | "SSR" {
  if (biteScore >= 90) return "SSR"
  if (biteScore >= 70) return "SR"
  if (biteScore >= 40) return "R"
  return "N"
}

export function getTodayNutrition(cards: FoodCard[]) {
  return {
    totalKcalMin: cards.reduce((s, c) => s + c.kcalMin, 0),
    totalKcalMax: cards.reduce((s, c) => s + c.kcalMax, 0),
    totalProtein: cards.reduce((s, c) => s + c.protein, 0),
    totalCarbs: cards.reduce((s, c) => s + c.carbs, 0),
    totalFat: cards.reduce((s, c) => s + c.fat, 0),
  }
}
