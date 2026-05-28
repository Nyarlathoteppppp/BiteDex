"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Camera, LibraryBig } from "lucide-react";
import type { DexItem } from "@/types";
import { getDex } from "@/lib/storage";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/app/components/language-toggle";

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
  const text = language === "zh"
    ? {
        dashboard: "首页",
        title: "食物图鉴",
        subtitle: "把每一口变成可收藏卡片。",
        capture: "拍照",
        emptyTitle: "还没有卡片",
        emptyDesc: "先拍第一张食物照片，图鉴就会开始积累。",
      }
    : {
        dashboard: "Dashboard",
        title: "Food Dex",
        subtitle: "Turn every bite into a card.",
        capture: "Capture",
        emptyTitle: "No cards yet",
        emptyDesc: "Capture your first food photo to start collecting cards in your Food Dex.",
      };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.9),transparent_42%),linear-gradient(180deg,#fbf6ee_0%,#f5ecdf_100%)]">
      <div className="mx-auto flex max-w-[800px] flex-col gap-5 px-4 py-6 sm:gap-7 sm:px-6">
        <header className="flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#9b856d]"
            >
              <ArrowLeft size={16} />
              {text.dashboard}
            </Link>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1f1b16] sm:text-3xl">{text.title}</h1>
            <p className="mt-1 text-sm text-[#9b856d]">{text.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle language={language} onChange={setLanguage} />
            <Link
              href="/capture"
              className="inline-flex items-center gap-2 rounded-full bg-[#1f1b16] px-4 py-2 text-xs font-semibold text-white shadow-sm sm:text-sm"
            >
              <Camera size={15} />
              {text.capture}
            </Link>
          </div>
        </header>

        {sortedItems.length === 0 ? (
          <section className="flex min-h-[300px] flex-col items-center justify-center rounded-[32px] border border-[rgba(70,50,30,0.08)] bg-[rgba(255,253,248,0.96)] p-8 text-center shadow-[0_24px_70px_rgba(70,50,30,0.10)]">
            <LibraryBig size={36} className="text-[#9b856d]" />
            <h2 className="mt-4 text-xl font-bold text-[#1f1b16]">{text.emptyTitle}</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[#9b856d]">
              {text.emptyDesc}
            </p>
          </section>
        ) : (
          <section className="grid grid-cols-2 gap-3.5 sm:gap-4">
            {sortedItems.map((item, index) => (
              <DexMiniCard key={item.foodName} item={item} index={index + 1} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function DexMiniCard({ item, index }: { item: DexItem; index: number }) {
  return (
    <article className="overflow-hidden rounded-[22px] border border-[rgba(70,50,30,0.08)] bg-[rgba(255,253,248,0.96)] shadow-[0_12px_40px_rgba(70,50,30,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_50px_rgba(70,50,30,0.12)]">
      <div className="aspect-square overflow-hidden bg-[#f1e7d8]">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.foodName}
            className="h-full w-full object-cover saturate-[0.96] contrast-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#b3a390]">
            <LibraryBig size={28} />
          </div>
        )}
      </div>

      <div className="p-3.5 sm:p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#a08a73]">
            #{String(index).padStart(3, "0")}
          </span>
          <span className="rounded-full bg-[#f3eadc] px-2 py-0.5 text-[10px] font-medium text-[#7b624c]">
            {item.rarity}
          </span>
        </div>

        <h3 className="mt-2 truncate text-[15px] font-bold leading-tight tracking-tight text-[#1f1b16] sm:text-base">
          {item.foodName}
        </h3>

        <p className="mt-1 text-[11px] text-[#9b856d] sm:text-xs">
          {formatDate(item.lastSeenAt)}
        </p>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[#f7efe4] px-2.5 py-1 text-[11px] font-medium text-[#3b3027]">
            {item.avgKcalMin}-{item.avgKcalMax} kcal
          </span>
          {item.count > 1 && (
            <span className="rounded-full bg-[#f1e4d2] px-2.5 py-1 text-[11px] font-medium text-[#6f563f]">
              ×{item.count}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}
