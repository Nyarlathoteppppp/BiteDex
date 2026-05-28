"use client";

import { useEffect, useState } from "react";
import type { MealType, PetStatus } from "@/types";

export type Language = "zh" | "en";

const LANGUAGE_KEY = "bitedex.language.v1";

export function useLanguage(defaultLanguage: Language = "zh") {
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  useEffect(() => {
    const saved = window.localStorage.getItem(LANGUAGE_KEY);
    if (saved === "zh" || saved === "en") {
      setLanguage(saved);
    }
  }, []);

  function updateLanguage(next: Language) {
    setLanguage(next);
    window.localStorage.setItem(LANGUAGE_KEY, next);
  }

  return { language, setLanguage: updateLanguage };
}

export function localizeMealType(type: MealType, language: Language): string {
  const map: Record<MealType, { zh: string; en: string }> = {
    breakfast: { zh: "早餐", en: "Breakfast" },
    lunch: { zh: "午餐", en: "Lunch" },
    dinner: { zh: "晚餐", en: "Dinner" },
    snack: { zh: "加餐", en: "Snack" },
    drink: { zh: "饮品", en: "Drink" },
    other: { zh: "其他", en: "Other" },
  };
  return map[type][language];
}

export function localizePetStatus(status: PetStatus, language: Language): string {
  const map: Record<PetStatus, { zh: string; en: string }> = {
    normal: { zh: "正常", en: "Normal" },
    energized: { zh: "元气满满", en: "Energized" },
    chubby: { zh: "圆润状态", en: "Chubby" },
    tired: { zh: "低能量", en: "Tired" },
    sugar_rush: { zh: "糖分亢奋", en: "Sugar Rush" },
    overloaded: { zh: "能量过载", en: "Overloaded" },
    protein_power: { zh: "蛋白质充足", en: "Protein Power" },
    diet_mode: { zh: "轻盈模式", en: "Diet Mode" },
  };
  return map[status][language];
}
