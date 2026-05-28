"use client";

import type {
  DailyLog,
  DailyLogsByDate,
  DexByFoodName,
  FoodCard,
} from "@/types";
import { buildDailyLog, mergeDexItem } from "@/lib/nutrition";
import { getLocalDateKey } from "@/lib/utils/dates";

export const dailyLogsKey = "bitedex.dailyLogs.v1";
export const dexKey = "bitedex.dex.v1";

export function getDailyLogs(): DailyLogsByDate {
  return readJson<DailyLogsByDate>(dailyLogsKey, {});
}

export function getDex(): DexByFoodName {
  return readJson<DexByFoodName>(dexKey, {});
}

export function getTodayLog(today = new Date()): DailyLog {
  const date = getLocalDateKey(today);
  const logs = getDailyLogs();

  return logs[date] ?? buildDailyLog(date, []);
}

export function addFoodCard(food: FoodCard): DailyLog {
  const logs = getDailyLogs();
  const existingLog = logs[food.date] ?? buildDailyLog(food.date, []);
  const nextLog = buildDailyLog(food.date, [...existingLog.foods, food]);
  const dex = getDex();

  logs[food.date] = nextLog;
  dex[food.foodName] = mergeDexItem(dex[food.foodName], food);

  writeJson(dailyLogsKey, logs);
  writeJson(dexKey, dex);

  return nextLog;
}

export function deleteFoodCard(foodId: string, date: string): DailyLog {
  const logs = getDailyLogs();
  const currentLog = logs[date] ?? buildDailyLog(date, []);
  const nextLog = buildDailyLog(
    date,
    currentLog.foods.filter((food) => food.id !== foodId),
  );

  logs[date] = nextLog;
  writeJson(dailyLogsKey, logs);
  rebuildDexFromLogs(logs);

  return nextLog;
}

export function clearBiteDexData(): void {
  window.localStorage.removeItem(dailyLogsKey);
  window.localStorage.removeItem(dexKey);
}

function rebuildDexFromLogs(logs: DailyLogsByDate): DexByFoodName {
  const dex = Object.values(logs)
    .flatMap((log) => log.foods)
    .reduce<DexByFoodName>((nextDex, food) => {
      nextDex[food.foodName] = mergeDexItem(nextDex[food.foodName], food);
      return nextDex;
    }, {});

  writeJson(dexKey, dex);
  return dex;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = window.localStorage.getItem(key);

  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  window.localStorage.setItem(key, JSON.stringify(value));
}
