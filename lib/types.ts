export type MealType = "breakfast" | "lunch" | "dinner" | "snack"

export type FoodTag =
  | "high_sugar"
  | "high_fat"
  | "high_carb"
  | "high_protein"
  | "sweet"
  | "dessert"
  | "drink"
  | "snack"
  | "fried"
  | "creamy"
  | "fast_food"
  | "balanced"
  | "low_calorie"
  | "high_calorie"

export type Rarity = "N" | "R" | "SR" | "SSR"

export type FoodCard = {
  id: string
  date: string
  time: string
  mealType: MealType
  foodName: string
  portion: string
  imageUrl: string
  kcalMin: number
  kcalMax: number
  protein: number
  carbs: number
  fat: number
  tags: FoodTag[]
  rarity: Rarity
  biteScore: number
  confidence: number
  advice: string
  createdAt: string
}

export type PetStatus =
  | "normal"
  | "energized"
  | "chubby"
  | "tired"
  | "sugar_rush"
  | "overloaded"

export type PetState = {
  status: PetStatus
  title: string
  imageUrl: string
}

export type PetDialogue = {
  title: string
  message: string
  reason: string
  suggestion: string
}

export type RecognizedFood = {
  foodName: string
  portion: string
  estimatedMealType: MealType
  kcalMin: number
  kcalMax: number
  protein: number
  carbs: number
  fat: number
  tags: FoodTag[]
  confidence: number
  biteScore: number
  advice: string
}

export type DailyLog = {
  date: string
  cards: FoodCard[]
}

export type DexEntry = {
  foodName: string
  count: number
  avgKcalMin: number
  avgKcalMax: number
  bestRarity: Rarity
  tags: FoodTag[]
  lastImageUrl: string
}
