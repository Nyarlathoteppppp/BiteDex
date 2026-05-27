import { RecognizedFood, FoodTag, MealType } from "./types"

type MockTemplate = {
  foodName: string
  portion: string
  estimatedMealType: MealType
  kcalMin: number
  kcalMax: number
  protein: number
  carbs: number
  fat: number
  tags: FoodTag[]
  biteScore: number
  advice: string
}

const templates: MockTemplate[] = [
  {
    foodName: "Rice Bowl",
    portion: "1 bowl",
    estimatedMealType: "lunch",
    kcalMin: 350,
    kcalMax: 450,
    protein: 8,
    carbs: 65,
    fat: 5,
    tags: ["high_carb"],
    biteScore: 55,
    advice: "A solid carb source. Pair with protein for balance.",
  },
  {
    foodName: "Sandwich",
    portion: "1 piece",
    estimatedMealType: "lunch",
    kcalMin: 280,
    kcalMax: 380,
    protein: 15,
    carbs: 32,
    fat: 12,
    tags: ["balanced"],
    biteScore: 65,
    advice: "A balanced choice with decent protein.",
  },
  {
    foodName: "Burger",
    portion: "1 piece",
    estimatedMealType: "lunch",
    kcalMin: 450,
    kcalMax: 650,
    protein: 25,
    carbs: 40,
    fat: 28,
    tags: ["high_fat", "fast_food", "high_calorie"],
    biteScore: 42,
    advice: "High in calories and fat. Treat as occasional.",
  },
  {
    foodName: "Noodles",
    portion: "1 bowl",
    estimatedMealType: "dinner",
    kcalMin: 400,
    kcalMax: 550,
    protein: 12,
    carbs: 60,
    fat: 15,
    tags: ["high_carb"],
    biteScore: 50,
    advice: "Moderate meal. Watch the sodium.",
  },
  {
    foodName: "Salad",
    portion: "1 plate",
    estimatedMealType: "lunch",
    kcalMin: 120,
    kcalMax: 200,
    protein: 5,
    carbs: 15,
    fat: 8,
    tags: ["low_calorie", "balanced"],
    biteScore: 82,
    advice: "Great low-cal choice! Add protein if it's a main meal.",
  },
  {
    foodName: "Fried Chicken",
    portion: "2 pieces",
    estimatedMealType: "dinner",
    kcalMin: 400,
    kcalMax: 560,
    protein: 30,
    carbs: 18,
    fat: 28,
    tags: ["fried", "high_fat", "high_protein"],
    biteScore: 38,
    advice: "High protein but very oily. Balance with veggies.",
  },
  {
    foodName: "Pizza",
    portion: "2 slices",
    estimatedMealType: "dinner",
    kcalMin: 450,
    kcalMax: 600,
    protein: 18,
    carbs: 50,
    fat: 22,
    tags: ["high_fat", "high_carb", "fast_food"],
    biteScore: 35,
    advice: "Tasty but calorie-dense. One slice is enough.",
  },
  {
    foodName: "Chocolate Cake",
    portion: "1 slice",
    estimatedMealType: "snack",
    kcalMin: 320,
    kcalMax: 460,
    protein: 5,
    carbs: 52,
    fat: 18,
    tags: ["dessert", "sweet", "high_sugar", "snack"],
    biteScore: 30,
    advice: "High in sugar and fat. Better as an occasional treat.",
  },
  {
    foodName: "Milk Tea",
    portion: "1 cup",
    estimatedMealType: "snack",
    kcalMin: 250,
    kcalMax: 400,
    protein: 3,
    carbs: 45,
    fat: 8,
    tags: ["drink", "sweet", "high_sugar"],
    biteScore: 25,
    advice: "Lots of hidden sugar. Choose less sweet options.",
  },
  {
    foodName: "Coffee",
    portion: "1 cup",
    estimatedMealType: "breakfast",
    kcalMin: 5,
    kcalMax: 50,
    protein: 1,
    carbs: 2,
    fat: 0,
    tags: ["drink", "low_calorie"],
    biteScore: 70,
    advice: "Almost zero calories if black. Watch the sugar add-ons.",
  },
  {
    foodName: "Fruit Plate",
    portion: "1 plate",
    estimatedMealType: "snack",
    kcalMin: 80,
    kcalMax: 150,
    protein: 2,
    carbs: 25,
    fat: 1,
    tags: ["low_calorie", "balanced"],
    biteScore: 88,
    advice: "Excellent snack choice. Rich in vitamins!",
  },
]

export function getRandomMockFood(): RecognizedFood {
  const t = templates[Math.floor(Math.random() * templates.length)]
  return { ...t, confidence: 0.75 + Math.random() * 0.2 }
}

export function getMockTemplates(): MockTemplate[] {
  return templates
}
