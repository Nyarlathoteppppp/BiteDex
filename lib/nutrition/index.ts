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
} from "@/types";

const sugarTags = new Set<FoodTag>([
  "high_sugar",
  "sweet",
  "dessert",
  "drink",
]);

const fatTags = new Set<FoodTag>(["high_fat", "fried", "creamy"]);

const rarityRank: Record<Rarity, number> = {
  N: 0,
  R: 1,
  SR: 2,
  SSR: 3,
};

const petImageByStatus: Record<PetStatus, string> = {
  normal: "/pets/normal.png",
  energized: "/pets/energized.png",
  chubby: "/pets/chubby.png",
  tired: "/pets/tired.png",
  sugar_rush: "/pets/sugar-rush.png",
  overloaded: "/pets/overloaded.png",
};

const petTitleByStatus: Record<PetStatus, string> = {
  normal: "Normal",
  energized: "Energized",
  chubby: "Chubby",
  tired: "Tired",
  sugar_rush: "Sugar Rush",
  overloaded: "Energy Overload",
};

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
    {
      records: 0,
      kcalMin: 0,
      kcalMax: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  );
}

export function computeRarity(food: {
  kcalMax: number;
  tags: FoodTag[];
}): Rarity {
  let rarity: Rarity = "N";

  if (food.kcalMax >= 900) {
    rarity = "SSR";
  } else if (food.kcalMax >= 600) {
    rarity = "SR";
  } else if (food.kcalMax >= 300) {
    rarity = "R";
  }

  if (food.tags.some((tag) => sugarTags.has(tag) || fatTags.has(tag))) {
    return upgradeRarity(rarity);
  }

  return rarity;
}

export function computePetState(foods: FoodCard[]): PetState {
  const total = calculateDailyTotal(foods);
  const highSugarCount = foods.filter(isHighSugarFood).length;
  const highFatCount = foods.filter(isHighFatFood).length;

  let status: PetStatus = "normal";

  if (total.kcalMin > 2800) {
    status = "overloaded";
  } else if (highSugarCount >= 2) {
    status = "sugar_rush";
  } else if (total.records >= 2 && total.kcalMax < 1000) {
    status = "tired";
  } else if (total.kcalMin > 2200 || highFatCount >= 2) {
    status = "chubby";
  } else if (total.kcalMin >= 1200 && total.kcalMin <= 2200 && total.protein >= 60) {
    status = "energized";
  }

  return {
    status,
    title: petTitleByStatus[status],
    imageUrl: petImageByStatus[status],
  };
}

export function generatePetDialogue(
  petState: PetState,
  foods: FoodCard[],
): PetDialogue {
  const total = calculateDailyTotal(foods);
  const highSugarCount = foods.filter(isHighSugarFood).length;
  const highFatCount = foods.filter(isHighFatFood).length;

  if (foods.length === 0) {
    return {
      title: "Ready to Eat",
      message: "I am waiting for today's first food card.",
      reason: "No meals have been recorded yet.",
      suggestion: "Upload a meal photo to start today's BiteDex.",
    };
  }

  if (petState.status === "overloaded") {
    return {
      title: "Energy Overload",
      message: "I feel energy-overloaded today.",
      reason: `Your recorded foods already reached ${total.kcalMin}-${total.kcalMax} kcal.`,
      suggestion: "Try a lighter pattern tomorrow with fewer fried, creamy, or oversized meals.",
    };
  }

  if (petState.status === "sugar_rush") {
    return {
      title: "Sugar Rush",
      message: "I entered sugar-rush mode.",
      reason: `Sweet foods or sugary drinks appeared ${highSugarCount} times today.`,
      suggestion: "Choose unsweetened drinks next time and add protein or vegetables.",
    };
  }

  if (petState.status === "tired") {
    return {
      title: "Low Energy",
      message: "My energy is running low.",
      reason: "You recorded multiple foods, but the total calorie range is still low.",
      suggestion: "Add a balanced meal with protein, grains, and vegetables.",
    };
  }

  if (petState.status === "chubby") {
    return {
      title: "Chubby Mode",
      message: "I am getting rounder today.",
      reason: `Calories or high-fat foods are trending up. High-fat cards: ${highFatCount}.`,
      suggestion: "Balance the next meal with lean protein, vegetables, and less fried food.",
    };
  }

  if (petState.status === "energized") {
    return {
      title: "Energized",
      message: "I feel strong and steady.",
      reason: `Today's protein reached ${total.protein}g within a moderate calorie range.`,
      suggestion: "Keep this balanced pattern and avoid adding too many sweet drinks.",
    };
  }

  return {
    title: "Normal",
    message: "I am stable today.",
    reason: "Your recorded food pattern has not triggered a special state yet.",
    suggestion: "Keep recording meals so I can show a clearer pattern.",
  };
}

export function computeHighlights(foods: FoodCard[]): DailyHighlights {
  return {
    highestCalorie: maxBy(foods, (food) => food.kcalMax),
    highestProtein: maxBy(foods, (food) => food.protein),
    calorieAssassin: maxBy(
      foods.filter((food) => food.kcalMax >= 300 && food.protein < 10),
      (food) => food.kcalMax,
    ),
  };
}

export function buildDailyLog(date: string, foods: FoodCard[]): DailyLog {
  const petState = computePetState(foods);

  return {
    date,
    foods,
    total: calculateDailyTotal(foods),
    highlights: computeHighlights(foods),
    petState,
    dialogue: generatePetDialogue(petState, foods),
  };
}

export function mergeDexItem(
  current: DexItem | undefined,
  food: FoodCard,
): DexItem {
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
    };
  }

  const count = current.count + 1;

  return {
    ...current,
    lastSeenAt: food.createdAt,
    count,
    imageUrl: current.imageUrl || food.imageUrl,
    tags: mergeTags(current.tags, food.tags),
    rarity:
      rarityRank[food.rarity] > rarityRank[current.rarity]
        ? food.rarity
        : current.rarity,
    avgKcalMin: Math.round((current.avgKcalMin * current.count + food.kcalMin) / count),
    avgKcalMax: Math.round((current.avgKcalMax * current.count + food.kcalMax) / count),
  };
}

export function getSevenDayAnalysis(
  logsByDate: DailyLogsByDate,
  today = new Date(),
): SevenDayAnalysis {
  const dates = getRecentDateKeys(today, 7);
  const logs = dates.map((date) => logsByDate[date]).filter(Boolean);
  const totals = logs.map((log) => log.total);
  const foodCards = totals.reduce((sum, total) => sum + total.records, 0);
  const recordedDays = logs.length;
  const kcalMinSum = totals.reduce((sum, total) => sum + total.kcalMin, 0);
  const kcalMaxSum = totals.reduce((sum, total) => sum + total.kcalMax, 0);
  const highSugarDays = logs.filter((log) => log.foods.some(isHighSugarFood)).length;
  const highFatDays = logs.filter((log) => log.foods.some(isHighFatFood)).length;
  const highProteinDays = logs.filter((log) => log.total.protein >= 60).length;
  const overloadedDays = logs.filter(
    (log) => log.petState.status === "overloaded",
  ).length;

  return {
    recordedDays,
    foodCards,
    averageDailyKcalMin: recordedDays ? Math.round(kcalMinSum / recordedDays) : 0,
    averageDailyKcalMax: recordedDays ? Math.round(kcalMaxSum / recordedDays) : 0,
    highestCalorieDay: maxBy(logs, (log) => log.total.kcalMax)
      ? {
          date: maxBy(logs, (log) => log.total.kcalMax)!.date,
          kcalMax: maxBy(logs, (log) => log.total.kcalMax)!.total.kcalMax,
        }
      : undefined,
    lowestCalorieDay: minBy(logs, (log) => log.total.kcalMin)
      ? {
          date: minBy(logs, (log) => log.total.kcalMin)!.date,
          kcalMin: minBy(logs, (log) => log.total.kcalMin)!.total.kcalMin,
        }
      : undefined,
    highSugarDays,
    highFatDays,
    highProteinDays,
    overloadedDays,
    petStatusDistribution: computePetStatusDistribution(logs),
    summary: buildWeeklySummary(recordedDays, highSugarDays, highFatDays, overloadedDays),
    advice: buildWeeklyAdvice(highSugarDays, highFatDays, overloadedDays),
  };
}

function isHighSugarFood(food: FoodCard): boolean {
  return food.tags.some((tag) => sugarTags.has(tag));
}

function isHighFatFood(food: FoodCard): boolean {
  return food.fat >= 25 || food.tags.some((tag) => fatTags.has(tag));
}

function upgradeRarity(rarity: Rarity): Rarity {
  if (rarity === "N") return "R";
  if (rarity === "R") return "SR";
  if (rarity === "SR") return "SSR";
  return "SSR";
}

function mergeTags(left: FoodTag[], right: FoodTag[]): FoodTag[] {
  return Array.from(new Set([...left, ...right]));
}

function maxBy<T>(items: T[], getValue: (item: T) => number): T | undefined {
  return items.reduce<T | undefined>((best, item) => {
    if (!best || getValue(item) > getValue(best)) {
      return item;
    }

    return best;
  }, undefined);
}

function minBy<T>(items: T[], getValue: (item: T) => number): T | undefined {
  return items.reduce<T | undefined>((best, item) => {
    if (!best || getValue(item) < getValue(best)) {
      return item;
    }

    return best;
  }, undefined);
}

function getRecentDateKeys(today: Date, days: number): string[] {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    return toDateKey(date);
  });
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function computePetStatusDistribution(logs: DailyLog[]): PetStatusDistribution {
  const initial: PetStatusDistribution = {
    normal: 0,
    energized: 0,
    chubby: 0,
    tired: 0,
    sugar_rush: 0,
    overloaded: 0,
  };

  return logs.reduce<PetStatusDistribution>((distribution, log) => {
    distribution[log.petState.status] += 1;
    return distribution;
  }, initial);
}

function buildWeeklySummary(
  recordedDays: number,
  highSugarDays: number,
  highFatDays: number,
  overloadedDays: number,
): string {
  if (recordedDays === 0) {
    return "No food cards were recorded in the last 7 days.";
  }

  if (overloadedDays > 0) {
    return "At least one day reached energy overload in the last 7 days.";
  }

  if (highSugarDays >= 3) {
    return "Sugar appeared frequently across the week.";
  }

  if (highFatDays >= 3) {
    return "High-fat foods appeared often across the week.";
  }

  return "Your weekly pattern looks relatively steady so far.";
}

function buildWeeklyAdvice(
  highSugarDays: number,
  highFatDays: number,
  overloadedDays: number,
): string {
  if (overloadedDays > 0) {
    return "Reduce oversized meals first, then adjust snacks and sweet drinks.";
  }

  if (highSugarDays >= highFatDays && highSugarDays > 0) {
    return "Reducing sweet drinks may improve your weekly pattern faster than cutting main meals.";
  }

  if (highFatDays > 0) {
    return "Try replacing fried or creamy meals with grilled protein and vegetables.";
  }

  return "Keep recording consistently to reveal a clearer trend.";
}

