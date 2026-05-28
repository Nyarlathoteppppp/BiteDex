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
import type { Language } from "@/lib/i18n";
import { getLocalDateKey } from "@/lib/utils/dates";

const sugarTags = new Set<FoodTag>([
  "high_sugar",
  "sweet",
  "dessert",
  "drink",
]);

const fatTags = new Set<FoodTag>(["high_fat", "fried", "creamy"]);

const proteinTags = new Set<FoodTag>(["high_protein"]);

const rarityRank: Record<Rarity, number> = {
  N: 0,
  R: 1,
  SR: 2,
  SSR: 3,
};

const petImageByStatus: Record<PetStatus, string> = {
  normal: "/pets/Normal.png",
  energized: "/pets/Energized.png",
  chubby: "/pets/Chubby.png",
  tired: "/pets/Tired.png",
  sugar_rush: "/pets/Sugar%20Rush.png",
  overloaded: "/pets/Overloaded.png",
  protein_power: "/pets/Protein%20Power.png",
  diet_mode: "/pets/Diet%20Mode.png",
};

const petTitleByStatus: Record<PetStatus, { zh: string; en: string }> = {
  normal: { zh: "正常", en: "Normal" },
  energized: { zh: "元气满满", en: "Energized" },
  chubby: { zh: "圆润状态", en: "Chubby" },
  tired: { zh: "低能量", en: "Tired" },
  sugar_rush: { zh: "糖分亢奋", en: "Sugar Rush" },
  overloaded: { zh: "能量过载", en: "Energy Overload" },
  protein_power: { zh: "蛋白质充足", en: "Protein Power" },
  diet_mode: { zh: "轻盈模式", en: "Diet Mode" },
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

export function computePetState(foods: FoodCard[], language: Language = "en"): PetState {
  const total = calculateDailyTotal(foods);
  const highSugarCount = foods.filter(isHighSugarFood).length;
  const highFatCount = foods.filter(isHighFatFood).length;
  const highProteinCount = foods.filter(isHighProteinFood).length;
  const lightBalancedCount = foods.filter(isLightBalancedFood).length;

  let status: PetStatus = "normal";

  if (foods.length === 0) {
    status = "normal";
  } else if (total.kcalMin > 2800) {
    status = "overloaded";
  } else if (highSugarCount >= 2) {
    status = "sugar_rush";
  } else if (total.records >= 2 && total.kcalMax < 1000) {
    status = "tired";
  } else if (total.kcalMin > 2200 || highFatCount >= 2) {
    status = "chubby";
  } else if (total.protein >= 90 || highProteinCount >= 3) {
    status = "protein_power";
  } else if (
    lightBalancedCount >= 2 &&
    total.kcalMax <= 1000 &&
    total.protein >= 20
  ) {
    status = "diet_mode";
  } else if (total.kcalMin >= 1200 && total.kcalMin <= 2200 && total.protein >= 60) {
    status = "energized";
  }

  return {
    status,
    title: petTitleByStatus[status][language],
    imageUrl: petImageByStatus[status],
  };
}

export function generatePetDialogue(
  petState: PetState,
  foods: FoodCard[],
  language: Language = "en",
): PetDialogue {
  const total = calculateDailyTotal(foods);
  const highSugarCount = foods.filter(isHighSugarFood).length;
  const highFatCount = foods.filter(isHighFatFood).length;

  if (foods.length === 0) {
    if (language === "zh") {
      return {
        title: "宠物日报",
        message: "我的便当盒今天还是空的。",
        reason: "你还没有喂我任何食物卡。",
        suggestion: "上传一张食物照片，我就能开始品尝并反馈状态。",
      };
    }
    return {
      title: "Pet Review",
      message: "My lunchbox is still empty.",
      reason: "No food cards have been fed to me yet.",
      suggestion: "Upload a food photo and I will taste it with my eyes.",
    };
  }

  const latestFood = foods[foods.length - 1];

  if (petState.status === "overloaded") {
    if (language === "zh") {
      return {
        title: "宠物日报",
        message: `我刚吃了${latestFood.foodName}，肚子快报警了。`,
        reason: `今天累计摄入已达 ${total.kcalMin}-${total.kcalMax} kcal。`,
        suggestion: "下一餐试试清淡些，让我少滚两圈，多蹦两下。",
      };
    }
    return {
      title: "Pet Review",
      message: `I tried ${latestFood.foodName} and my belly is beeping.`,
      reason: `Today's food cards reached ${total.kcalMin}-${total.kcalMax} kcal.`,
      suggestion: "Tomorrow, feed me something lighter so I can roll less and wiggle more.",
    };
  }

  if (petState.status === "sugar_rush") {
    if (language === "zh") {
      return {
        title: "宠物日报",
        message: `${latestFood.foodName}让我瞬间糖分上头！`,
        reason: `今天甜食或含糖饮品已经出现 ${highSugarCount} 次。`,
        suggestion: "下一次搭配一点蛋白质或白水，我就不会乱窜了。",
      };
    }
    return {
      title: "Pet Review",
      message: `That ${latestFood.foodName} made my sparkle meter jump.`,
      reason: `Sweet foods or sugary drinks appeared ${highSugarCount} times today.`,
      suggestion: "A little protein or water next time will help me stop zooming around.",
    };
  }

  if (petState.status === "tired") {
    if (language === "zh") {
      return {
        title: "宠物日报",
        message: `我吃了${latestFood.foodName}，但还是有点没精神。`,
        reason: `目前总摄入仍偏低：${total.kcalMin}-${total.kcalMax} kcal，蛋白质 ${total.protein}g。`,
        suggestion: "给我来一顿均衡餐：蛋白质 + 主食 + 蔬菜。",
      };
    }
    return {
      title: "Pet Review",
      message: `I tasted ${latestFood.foodName}, but I still feel sleepy.`,
      reason: `Today's cards are still light: ${total.kcalMin}-${total.kcalMax} kcal and ${total.protein}g protein.`,
      suggestion: "Feed me a balanced meal with protein, grains, and vegetables.",
    };
  }

  if (petState.status === "chubby") {
    if (language === "zh") {
      return {
        title: "宠物日报",
        message: `${latestFood.foodName}很好吃，我今天有点圆滚滚。`,
        reason: `总热量或高脂食物在上升。高脂卡片数：${highFatCount}。`,
        suggestion: "下一餐试试瘦蛋白和蔬菜，让我继续轻盈弹跳。",
      };
    }
    return {
      title: "Pet Review",
      message: `${latestFood.foodName} was tasty. I am becoming a soft little round bean.`,
      reason: `Calories or high-fat foods are trending up. High-fat cards: ${highFatCount}.`,
      suggestion: "Next feeding can be lean protein and vegetables to keep me bouncy.",
    };
  }

  if (petState.status === "protein_power") {
    if (language === "zh") {
      return {
        title: "宠物日报",
        message: `${latestFood.foodName}让我感觉肌肉在发光！`,
        reason: `今天蛋白质累计达到 ${total.protein}g。`,
        suggestion: "这个方向很棒，继续搭配适量碳水和蔬菜更稳。",
      };
    }
    return {
      title: "Pet Review",
      message: `${latestFood.foodName} gave me tiny hero muscles.`,
      reason: `Today's protein reached ${total.protein}g.`,
      suggestion: "This is a strong pattern. Keep it balanced with carbs and vegetables.",
    };
  }

  if (petState.status === "diet_mode") {
    if (language === "zh") {
      return {
        title: "宠物日报",
        message: `${latestFood.foodName}吃起来很轻盈，我能轻松跳来跳去。`,
        reason: `今天整体偏轻，但仍相对均衡，蛋白质 ${total.protein}g。`,
        suggestion: "轻食模式不错，后续记得补充足够能量。",
      };
    }
    return {
      title: "Pet Review",
      message: `${latestFood.foodName} feels light. I can hop around easily.`,
      reason: `Today's cards look lighter but still balanced enough: ${total.protein}g protein.`,
      suggestion: "Nice light mode. Just make sure I still get enough energy later.",
    };
  }

  if (petState.status === "energized") {
    if (language === "zh") {
      return {
        title: "宠物日报",
        message: `${latestFood.foodName}让我眼睛发亮，准备开玩！`,
        reason: `今日蛋白质 ${total.protein}g，热量也在合理区间。`,
        suggestion: "继续保持这种均衡喂养，我给你点赞！",
      };
    }
    return {
      title: "Pet Review",
      message: `${latestFood.foodName} made me bright-eyed and ready to play.`,
      reason: `Today's protein reached ${total.protein}g within a moderate calorie range.`,
      suggestion: "Balanced feeding detected. I approve with happy paws.",
    };
  }

  if (language === "zh") {
    return {
      title: "宠物日报",
      message: `我刚尝了${latestFood.foodName}，肚子状态稳定。`,
      reason: "你的饮食模式暂未触发特殊状态。",
      suggestion: "继续喂我食物卡，我会给你更清晰的状态反馈。",
    };
  }
  return {
    title: "Pet Review",
    message: `I nibbled ${latestFood.foodName}. My tummy feels steady.`,
    reason: "Your recorded food pattern has not triggered a special state yet.",
    suggestion: "Keep feeding me food cards and I will show my mood more clearly.",
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

export function buildDailyLog(date: string, foods: FoodCard[], language: Language = "en"): DailyLog {
  const petState = computePetState(foods, language);

  return {
    date,
    foods,
    total: calculateDailyTotal(foods),
    highlights: computeHighlights(foods),
    petState,
    dialogue: generatePetDialogue(petState, foods, language),
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
  language: Language = "en",
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
    summary: buildWeeklySummary(recordedDays, highSugarDays, highFatDays, overloadedDays, language),
    advice: buildWeeklyAdvice(highSugarDays, highFatDays, overloadedDays, language),
  };
}

function isHighSugarFood(food: FoodCard): boolean {
  return food.tags.some((tag) => sugarTags.has(tag));
}

function isHighFatFood(food: FoodCard): boolean {
  return food.fat >= 25 || food.tags.some((tag) => fatTags.has(tag));
}

function isHighProteinFood(food: FoodCard): boolean {
  return food.protein >= 30 || food.tags.some((tag) => proteinTags.has(tag));
}

function isLightBalancedFood(food: FoodCard): boolean {
  return (
    food.kcalMax <= 450 &&
    food.tags.some((tag) => tag === "balanced" || tag === "low_calorie")
  );
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
    return getLocalDateKey(date);
  });
}

function computePetStatusDistribution(logs: DailyLog[]): PetStatusDistribution {
  const initial: PetStatusDistribution = {
    normal: 0,
    energized: 0,
    chubby: 0,
    tired: 0,
    sugar_rush: 0,
    overloaded: 0,
    protein_power: 0,
    diet_mode: 0,
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
  language: Language,
): string {
  if (language === "zh") {
    if (recordedDays === 0) return "近 7 天还没有记录食物卡。";
    if (overloadedDays > 0) return "近 7 天至少有一天进入了能量过载状态。";
    if (highSugarDays >= 3) return "这周甜食或含糖饮品出现较频繁。";
    if (highFatDays >= 3) return "这周高脂食物出现较频繁。";
    return "你这周的饮食趋势整体比较稳定。";
  }
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
  language: Language,
): string {
  if (language === "zh") {
    if (overloadedDays > 0) {
      return "先减少大份量，再逐步调整零食和甜饮。";
    }
    if (highSugarDays >= highFatDays && highSugarDays > 0) {
      return "优先减少甜饮，通常比减少主餐更快改善周趋势。";
    }
    if (highFatDays > 0) {
      return "尝试把油炸/奶油改成烤制蛋白质搭配蔬菜。";
    }
    return "继续稳定记录，趋势会越来越清晰。";
  }
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
