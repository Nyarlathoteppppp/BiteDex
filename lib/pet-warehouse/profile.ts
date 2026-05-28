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
      name: `Sweet Hatch ${generationIndex}`,
      title: "Sugar Spirit Food Pet",
      trait: "Sweet Aura",
      mood: "Bright-eyed and sparkly",
      description: "Hatched from sweet foods and sugary drinks. Its frosted body glows with candy energy.",
      sourceFoodIds: foods.map((food) => food.id),
      sourceFoodNames,
      tags,
      kcalMin,
      kcalMax,
    };
  }

  if (protein >= 60 || foods.some((food) => food.tags.some((tag) => proteinTags.has(tag)))) {
    return {
      name: `Power Paw ${generationIndex}`,
      title: "Muscle Build Food Pet",
      trait: "Strong Core",
      mood: "Sturdy and confident",
      description: "Forged from high-protein meals. Its dense body radiates a warm, powerful energy.",
      sourceFoodIds: foods.map((food) => food.id),
      sourceFoodNames,
      tags,
      kcalMin,
      kcalMax,
    };
  }

  if (kcalMax >= 1800 || fatCount >= 2) {
    return {
      name: `Cozy Round ${generationIndex}`,
      title: "Calorie Comfort Food Pet",
      trait: "Warm Belly",
      mood: "Satisfied and drowsy",
      description: "Born from rich, fried, and high-energy meals. Round and flushed, but irresistibly cute.",
      sourceFoodIds: foods.map((food) => food.id),
      sourceFoodNames,
      tags,
      kcalMin,
      kcalMax,
    };
  }

  if (lightCount >= 2 || kcalMax <= 1100) {
    return {
      name: `Leaf Wisp ${generationIndex}`,
      title: "Light Balance Food Pet",
      trait: "Fresh Breeze",
      mood: "Gentle and floaty",
      description: "Grown from light balanced meals and fresh ingredients. Thin lines and cool colors.",
      sourceFoodIds: foods.map((food) => food.id),
      sourceFoodNames,
      tags,
      kcalMin,
      kcalMax,
    };
  }

  return {
    name: `Bite Buddy ${generationIndex}`,
    title: "Mixed Meal Food Pet",
    trait: "Daily Blend",
    mood: "Curious and friendly",
    description: "Hatched from a varied meal pattern. Its patchwork body reflects the foods it absorbed.",
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

  const visualStyles = [
    "creamy hand-drawn pet",
    "soft clay toy pet",
    "plush doll pet",
    "light watercolor specimen illustration",
    "retro natural history illustration",
    "Japanese healing sticker pet",
    "low-saturation 3D figurine",
    "paper-cut collage pet",
    "food mascot character",
    "light fantasy creature concept art",
    "journal sticker pet",
    "picture book illustration pet",
  ];

  const skeletons = [
    "baby kangaroo", "hamster", "capybara", "rabbit", "fox", "hedgehog",
    "otter", "bear cub", "owl", "baby dinosaur", "gecko", "squirrel",
    "mushroom spirit", "cloud creature", "rice ball creature", "pudding creature",
    "bread beast", "plant beast", "crystal beast", "fluffy pom creature",
    "baby dragon", "baby sea otter", "baby alpaca", "tanuki",
  ];

  const style = visualStyles[Math.floor(Math.random() * visualStyles.length)];
  const skeleton1 = skeletons[Math.floor(Math.random() * skeletons.length)];
  const skeleton2 = skeletons[Math.floor(Math.random() * skeletons.length)];

  let moodLine = "The pet looks content and curious.";
  if (profile.tags.some((t) => ["high_sugar", "sweet", "dessert"].includes(t))) {
    moodLine = "The pet has bright eyes, excited pose, with subtle sparkle or candy elements.";
  } else if (profile.tags.some((t) => ["high_fat", "fried", "creamy", "high_calorie"].includes(t))) {
    moodLine = "The pet is rounder, satisfied expression, slightly flushed cheeks, cozy and lazy.";
  } else if (profile.tags.some((t) => ["high_protein", "balanced"].includes(t))) {
    moodLine = "The pet has a strong posture, energetic limbs, confident expression.";
  } else if (profile.tags.some((t) => ["low_calorie", "balanced"].includes(t))) {
    moodLine = "The pet is lighter, thinner lines, fresher colors, floaty and gentle.";
  }

  return [
    "You are an original Food Pet character designer.",
    `The user fed three foods: ${foodList}.`,
    `Food nutrition tags: ${tagList}.`,
    "Generate ONE original Food Pet creature that looks like it hatched from these three foods combined.",
    "",
    `Visual style: ${style}.`,
    `Body skeleton reference: blend of ${skeleton1} and ${skeleton2}.`,
    "",
    "Food element transformation rules:",
    "- Do NOT paste food directly on the pet. Transform food into natural body features:",
    "- Bread/toast → soft body texture, toasted color, rounded ears",
    "- Egg/yolk → glowing spots, belly color, eye highlights",
    "- Green vegetables → leaf-shaped ears, green fur accents, tail texture",
    "- Cream/cheese → soft flowing shapes, pale yellow fur",
    "- Fruit → low-saturation color patches",
    "- Rice → round dumpling body, white and soft proportions",
    "- Meat → warm brown fur, sturdy posture",
    "- Dessert → frosting texture, sparkle eyes, small decorations",
    "- Drinks → translucent feeling, flowing tail, cup-shape silhouette inspiration",
    "- Spicy/sauce → cheek blush, flame tail tip, small spots",
    "",
    moodLine,
    "",
    "Composition: single pet centered, full body visible, clean warm cream/beige background.",
    "Can have minimal food-related decorative elements around it.",
    "No text, no UI, no card frame, no multiple pets, no humans, no real animal photos.",
    "Do NOT copy Pokémon, Digimon, or any existing IP. Must be original Food Pet.",
    "The final result should feel like: this is a creature hatched from those three foods.",
  ].join("\n");
}

function mergeTags(tags: FoodTag[]): FoodTag[] {
  return Array.from(new Set(tags));
}

