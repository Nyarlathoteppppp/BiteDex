"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Camera, Sparkles } from "lucide-react";
import type { DexItem } from "@/types";
import { getDex } from "@/lib/storage";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/app/components/language-toggle";

const TOTAL_COLLECTION_TARGET = 150;
const WALL_VISIBLE_SLOTS = 15;

export default function DexPage() {
  const [items, setItems] = useState<DexItem[]>([]);
  const { language, setLanguage } = useLanguage("zh");

  useEffect(() => {
    setItems(Object.values(getDex()));
  }, []);

  const sortedItems = useMemo(
    () =>
      [...items].sort((left, right) => {
        if (right.count !== left.count) {
          return right.count - left.count;
        }
        return right.lastSeenAt.localeCompare(left.lastSeenAt);
      }),
    [items],
  );
  const visibleItems = sortedItems.slice(0, WALL_VISIBLE_SLOTS);
  const emptySlots = Math.max(0, WALL_VISIBLE_SLOTS - visibleItems.length);

  const text = language === "zh"
    ? {
        dashboard: "首页",
        title: "食物图鉴",
        subtitle: "把每一口，收藏成一张图鉴卡。",
        capture: "拍照",
        energy: "能量",
        protein: "蛋白",
        notCollected: "未解锁",
        emptySlot: "空卡位",
        collected: "已收集",
      }
    : {
        dashboard: "Dashboard",
        title: "Food Dex",
        subtitle: "Collect each bite as a dex card.",
        capture: "Capture",
        energy: "Energy",
        protein: "Protein",
        notCollected: "Not Collected",
        emptySlot: "Empty Slot",
        collected: "collected",
      };

  return (
    <main className="min-h-screen bg-[#f8f3ea] text-[#2f2721]">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-8 px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#8e7e6d]"
            >
              <ArrowLeft size={16} />
              {text.dashboard}
            </Link>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1f1b16] sm:text-4xl">{text.title}</h1>
            <p className="mt-2 text-sm text-[#8f8171]">{text.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle language={language} onChange={setLanguage} />
            <Link
              href="/capture"
              className="inline-flex items-center gap-2 rounded-full bg-[#1f1b16] px-5 py-2.5 text-xs font-semibold text-white shadow-sm sm:text-sm"
            >
              <Camera size={15} />
              {text.capture}
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {visibleItems.map((item, index) => (
            <DexFrontCard
              key={item.foodName}
              item={item}
              index={index + 1}
              energyLabel={text.energy}
              proteinLabel={text.protein}
            />
          ))}
          {Array.from({ length: emptySlots }, (_, i) => (
            <DexBackCard
              key={`empty-${i}`}
              index={visibleItems.length + i + 1}
              notCollected={text.notCollected}
              emptySlot={text.emptySlot}
            />
          ))}
        </section>

        <footer className="pt-2 text-center text-sm font-medium text-[#8f8171]">
          {sortedItems.length} / {TOTAL_COLLECTION_TARGET} {text.collected}
        </footer>
      </div>
    </main>
  );
}

function DexFrontCard({
  item,
  index,
  energyLabel,
  proteinLabel,
}: {
  item: DexItem;
  index: number;
  energyLabel: string;
  proteinLabel: string;
}) {
  const badge = pickBadge(item.tags, energyLabel, proteinLabel);

  return (
    <article className="rounded-[26px] border border-[rgba(70,50,30,0.08)] bg-[rgba(255,253,248,0.95)] p-3 shadow-[0_10px_28px_rgba(70,50,30,0.08)]">
      <div className="aspect-[4/5] overflow-hidden rounded-[20px] bg-[#eee4d4]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={item.foodName}
          className="h-full w-full object-cover saturate-[0.94]"
        />
      </div>
      <div className="p-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#a08a73]">
            #{String(index).padStart(3, "0")}
          </span>
          <span className="rounded-full bg-[#f3eadc] px-2 py-0.5 text-[10px] font-medium text-[#7b624c]">
            {item.rarity}
          </span>
        </div>
        <h3 className="mt-2 truncate text-[15px] font-semibold leading-tight tracking-tight text-[#1f1b16]">
          {item.foodName}
        </h3>
        <p className="mt-1 text-[11px] text-[#9b856d]">
          {formatDate(item.lastSeenAt)}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[#f7efe4] px-2.5 py-1 text-[11px] font-medium text-[#3b3027]">
            {item.avgKcalMin}-{item.avgKcalMax} kcal
          </span>
          <span className="rounded-full bg-[#efe3d2] px-2.5 py-1 text-[11px] font-medium text-[#6f563f]">
            {badge}
          </span>
        </div>
      </div>
    </article>
  );
}

function DexBackCard({
  index,
  notCollected,
  emptySlot,
}: {
  index: number;
  notCollected: string;
  emptySlot: string;
}) {
  return (
    <article className="rounded-[26px] border border-dashed border-[rgba(150,130,105,0.28)] bg-[#f6f0e5] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]">
      <div className="flex aspect-[4/5] flex-col items-center justify-center rounded-[20px] bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.65),rgba(246,237,222,0.85))] text-[#b5a792]">
        <Sparkles size={26} />
        <p className="mt-3 text-xs font-semibold">{notCollected}</p>
        <p className="mt-1 text-[11px]">{emptySlot}</p>
      </div>
      <div className="px-2.5 pt-2.5 text-[11px] font-medium text-[#b09d84]">
        #{String(index).padStart(3, "0")}
      </div>
    </article>
  );
}

function pickBadge(tags: string[], energyLabel: string, proteinLabel: string): string {
  if (tags.includes("high_protein")) return proteinLabel;
  return energyLabel;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}
