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
      name: `Sucranite ${generationIndex}`,
      title: "Fairy-type Food Pokémon",
      trait: "Sugar Coat",
      mood: "Hyperactive and sparkly",
      description: "A fairy-type creature crystallized from sweet foods and sugary drinks. Its candy-shell body glows when it absorbs sugar energy.",
      sourceFoodIds: foods.map((food) => food.id),
      sourceFoodNames,
      tags,
      kcalMin,
      kcalMax,
    };
  }

  if (protein >= 60 || foods.some((food) => food.tags.some((tag) => proteinTags.has(tag)))) {
    return {
      name: `Proteorex ${generationIndex}`,
      title: "Fighting-type Food Pokémon",
      trait: "Iron Fist",
      mood: "Determined and muscular",
      description: "A fighting-type creature forged from high-protein meals. Its dense, meaty body radiates raw power.",
      sourceFoodIds: foods.map((food) => food.id),
      sourceFoodNames,
      tags,
      kcalMin,
      kcalMax,
    };
  }

  if (kcalMax >= 1800 || fatCount >= 2) {
    return {
      name: `Frylax ${generationIndex}`,
      title: "Fire-type Food Pokémon",
      trait: "Thick Fat",
      mood: "Drowsy and well-fed",
      description: "A fire-type creature born from rich, fried, and high-calorie meals. Its oily golden hide stores enormous thermal energy.",
      sourceFoodIds: foods.map((food) => food.id),
      sourceFoodNames,
      tags,
      kcalMin,
      kcalMax,
    };
  }

  if (lightCount >= 2 || kcalMax <= 1100) {
    return {
      name: `Leaflora ${generationIndex}`,
      title: "Grass-type Food Pokémon",
      trait: "Natural Cure",
      mood: "Serene and light",
      description: "A grass-type creature grown from light balanced meals and fresh ingredients. Leaves and sprouts decorate its gentle body.",
      sourceFoodIds: foods.map((food) => food.id),
      sourceFoodNames,
      tags,
      kcalMin,
      kcalMax,
    };
  }

  return {
    name: `Omnibite ${generationIndex}`,
    title: "Normal-type Food Pokémon",
    trait: "Adaptability",
    mood: "Curious and friendly",
    description: "A normal-type creature assembled from a mixed meal pattern. Its patchwork body reflects the variety of foods it absorbed.",
    sourceFoodIds: foods.map((food) => food.id),
    sourceFoodNames,
    tags,
    kcalMin,
    kcalMax,
  };
}

export function buildPetImagePrompt(profile: GeneratedPetProfile): string {
  const foodList = profile.sourceFoodNames.join(", ");
  const tagList = profile.tags.join(", ") || "balanced everyday meal";

  return [
    "Design a single Pokémon-style creature inspired by real food.",
    `This creature is born from: ${foodList}.`,
    `Its food attribute tags are: ${tagList}.`,
    `Personality: ${profile.mood}. Trait: ${profile.trait}.`,
    "The creature's body, colors, and features should clearly reference the source foods — for example, a rice-based creature might have a white grain-textured body, a fried chicken creature might have golden crispy armor, a milk tea creature might have a boba-pearl tail.",
    "Pokémon art style: full body, front-facing, cute but battle-ready, expressive eyes, elemental aura matching its food type (fire for fried, water for drinks, grass for salad, fairy for desserts).",
    "Clean solid-color background, centered composition, high-quality digital illustration, collectible card game style.",
    "No text, no words, no logo, no human, no realistic animal photo.",
  ].join(" ");
}

function mergeTags(tags: FoodTag[]): FoodTag[] {
  return Array.from(new Set(tags));
}

