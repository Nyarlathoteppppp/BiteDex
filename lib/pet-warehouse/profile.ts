import type { FoodTag, GeneratedPet, PetSourceFood } from "@/types";

type GeneratedPetProfile = Pick<
  GeneratedPet,
  | "name"
  | "title"
  | "trait"
  | "mood"
  | "description"
  | "sourceFoodIds"
  | "sourceFoodNames"
  | "tags"
  | "kcalMin"
  | "kcalMax"
>;

const sugarTags = new Set<FoodTag>(["high_sugar", "sweet", "dessert", "drink"]);
const fatTags = new Set<FoodTag>(["high_fat", "fried", "creamy", "fast_food"]);
const proteinTags = new Set<FoodTag>(["high_protein", "balanced"]);
const lightTags = new Set<FoodTag>(["low_calorie", "balanced"]);

export function toPetSourceFood(food: PetSourceFood): PetSourceFood {
  return {
    id: food.id,
    foodName: food.foodName,
    portion: food.portion,
    kcalMin: food.kcalMin,
    kcalMax: food.kcalMax,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    tags: food.tags,
    rarity: food.rarity,
  };
}

export function buildGeneratedPetProfile(
  foods: PetSourceFood[],
  generationIndex: number,
): GeneratedPetProfile {
  const tags = mergeTags(foods.flatMap((food) => food.tags));
  const kcalMin = foods.reduce((sum, food) => sum + food.kcalMin, 0);
  const kcalMax = foods.reduce((sum, food) => sum + food.kcalMax, 0);
  const protein = foods.reduce((sum, food) => sum + food.protein, 0);
  const sugarCount = foods.filter((food) =>
    food.tags.some((tag) => sugarTags.has(tag)),
  ).length;
  const fatCount = foods.filter((food) =>
    food.fat >= 25 || food.tags.some((tag) => fatTags.has(tag)),
  ).length;
  const lightCount = foods.filter((food) =>
    food.kcalMax <= 450 && food.tags.some((tag) => lightTags.has(tag)),
  ).length;
  const sourceFoodNames = foods.map((food) => food.foodName);

  if (sugarCount >= 2) {
    return {
      name: `Sugar Puff ${generationIndex}`,
      title: "Sweet Spark Pet",
      trait: "Sugar glow",
      mood: "Bouncy and bright",
      description: "Born from sweet bites and drinks, with a shiny candy-like aura.",
      sourceFoodIds: foods.map((food) => food.id),
      sourceFoodNames,
      tags,
      kcalMin,
      kcalMax,
    };
  }

  if (protein >= 60 || foods.some((food) => food.tags.some((tag) => proteinTags.has(tag)))) {
    return {
      name: `Protein Cub ${generationIndex}`,
      title: "Tiny Strength Pet",
      trait: "Protein power",
      mood: "Confident and sturdy",
      description: "A compact little partner shaped by protein-rich meals.",
      sourceFoodIds: foods.map((food) => food.id),
      sourceFoodNames,
      tags,
      kcalMin,
      kcalMax,
    };
  }

  if (kcalMax >= 1800 || fatCount >= 2) {
    return {
      name: `Roundbite ${generationIndex}`,
      title: "Cozy Calorie Pet",
      trait: "Soft energy",
      mood: "Warm and sleepy",
      description: "A round food spirit created by rich, oily, or high-energy meals.",
      sourceFoodIds: foods.map((food) => food.id),
      sourceFoodNames,
      tags,
      kcalMin,
      kcalMax,
    };
  }

  if (lightCount >= 2 || kcalMax <= 1100) {
    return {
      name: `Leaf Nibble ${generationIndex}`,
      title: "Light Balance Pet",
      trait: "Fresh balance",
      mood: "Calm and floaty",
      description: "A gentle mini pet inspired by lighter balanced food cards.",
      sourceFoodIds: foods.map((food) => food.id),
      sourceFoodNames,
      tags,
      kcalMin,
      kcalMax,
    };
  }

  return {
    name: `Bite Buddy ${generationIndex}`,
    title: "Mixed Meal Pet",
    trait: "Daily blend",
    mood: "Curious and friendly",
    description: "A small collectible pet formed from this three-card meal pattern.",
    sourceFoodIds: foods.map((food) => food.id),
    sourceFoodNames,
    tags,
    kcalMin,
    kcalMax,
  };
}

export function buildPetImagePrompt(profile: GeneratedPetProfile): string {
  return [
    "Create one adorable original mini pet for a food collection app.",
    `Pet name: ${profile.name}.`,
    `Theme: ${profile.title}, ${profile.trait}, ${profile.mood}.`,
    `Inspired by these foods: ${profile.sourceFoodNames.join(", ")}.`,
    `Nutrition mood tags: ${profile.tags.join(", ") || "balanced everyday meal"}.`,
    "Full body, cute mascot, soft rounded shape, expressive eyes, collectible creature card style.",
    "Clean warm light background, centered composition, polished digital illustration.",
    "No words, no text, no logo, no human, no realistic animal, no scary style.",
  ].join(" ");
}

function mergeTags(tags: FoodTag[]): FoodTag[] {
  return Array.from(new Set(tags));
}

