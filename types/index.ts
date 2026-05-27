export const mealTypes = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "drink",
  "other",
] as const;

export type MealType = (typeof mealTypes)[number];

export const foodTags = [
  "high_sugar",
  "high_fat",
  "high_carb",
  "high_protein",
  "sweet",
  "dessert",
  "drink",
  "snack",
  "fried",
  "creamy",
  "fast_food",
  "balanced",
  "low_calorie",
  "high_calorie",
] as const;

export type FoodTag = (typeof foodTags)[number];

export type Rarity = "N" | "R" | "SR" | "SSR";

export type PetStatus =
  | "normal"
  | "energized"
  | "chubby"
  | "tired"
  | "sugar_rush"
  | "overloaded";

export type RecognizedFood = {
  foodName: string;
  portion: string;
  estimatedMealType: MealType;
  kcalMin: number;
  kcalMax: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: FoodTag[];
  confidence: number;
  biteScore: number;
  advice: string;
};

export type FoodCard = RecognizedFood & {
  id: string;
  date: string;
  time: string;
  mealType: MealType;
  imageUrl: string;
  rarity: Rarity;
  createdAt: string;
};

export type DailyTotal = {
  records: number;
  kcalMin: number;
  kcalMax: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type PetState = {
  status: PetStatus;
  title: string;
  imageUrl: string;
};

export type PetDialogue = {
  title: string;
  message: string;
  reason: string;
  suggestion: string;
};

export type DailyHighlights = {
  highestCalorie?: FoodCard;
  highestProtein?: FoodCard;
  calorieAssassin?: FoodCard;
};

export type DailyLog = {
  date: string;
  foods: FoodCard[];
  total: DailyTotal;
  highlights: DailyHighlights;
  petState: PetState;
  dialogue: PetDialogue;
};

export type DexItem = {
  foodName: string;
  firstSeenAt: string;
  lastSeenAt: string;
  count: number;
  imageUrl: string;
  tags: FoodTag[];
  rarity: Rarity;
  avgKcalMin: number;
  avgKcalMax: number;
};

export type DailyLogsByDate = Record<string, DailyLog>;

export type DexByFoodName = Record<string, DexItem>;

export type PetStatusDistribution = Record<PetStatus, number>;

export type SevenDayAnalysis = {
  recordedDays: number;
  foodCards: number;
  averageDailyKcalMin: number;
  averageDailyKcalMax: number;
  highestCalorieDay?: {
    date: string;
    kcalMax: number;
  };
  lowestCalorieDay?: {
    date: string;
    kcalMin: number;
  };
  highSugarDays: number;
  highFatDays: number;
  highProteinDays: number;
  overloadedDays: number;
  petStatusDistribution: PetStatusDistribution;
  summary: string;
  advice: string;
};

