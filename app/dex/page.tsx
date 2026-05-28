"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Camera, Flame, LibraryBig, Sparkles } from "lucide-react";
import type { DexItem, Rarity } from "@/types";
import { getDex } from "@/lib/storage";

export default function DexPage() {
  const [items, setItems] = useState<DexItem[]>([]);

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

  return (
    <main className="min-h-screen bg-[#fffaf3] text-[#231f20]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:gap-6 sm:px-8 sm:py-6 lg:px-10">
        <header className="flex items-center justify-between border-b border-[#eadbc7] pb-4 sm:pb-5">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f766e]"
            >
              <ArrowLeft size={18} />
              Dashboard
            </Link>
            <h1 className="mt-2 text-2xl font-bold sm:mt-3 sm:text-3xl">Food Dex</h1>
          </div>

          <Link
            href="/capture"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0f766e] px-3 py-2 text-xs font-semibold text-white shadow-sm sm:gap-2 sm:px-4 sm:text-sm"
          >
            <Camera size={16} />
            Upload
          </Link>
        </header>

        <section className="overflow-hidden rounded-lg border border-[#eadbc7] bg-white shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
            <div className="p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#0f766e] sm:text-sm">
                Collection
              </p>
              <h2 className="mt-1 text-xl font-bold sm:text-2xl">
                {items.length} collected foods
              </h2>
            </div>
            <div className="grid grid-cols-3 border-t border-[#eadbc7] sm:border-l sm:border-t-0">
              <DexMetric label="Cards" value={items.length} />
              <DexMetric
                label="Eaten"
                value={items.reduce((sum, item) => sum + item.count, 0)}
              />
              <DexMetric
                label="Rare"
                value={items.filter((item) => item.rarity === "SR" || item.rarity === "SSR").length}
              />
            </div>
          </div>
        </section>

        {sortedItems.length === 0 ? (
          <section className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-[#eadbc7] bg-white p-6 text-center shadow-sm sm:min-h-[360px] sm:p-8">
            <LibraryBig size={36} className="text-[#0f766e]" />
            <h2 className="mt-3 text-xl font-bold sm:mt-4 sm:text-2xl">No food cards yet</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#665f56] sm:leading-7">
              Add a card from the capture page and it will appear here as part of
              your BiteDex collection.
            </p>
          </section>
        ) : (
          <section className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {sortedItems.map((item) => (
              <DexCard key={item.foodName} item={item} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function DexCard({ item }: { item: DexItem }) {
  const rarityStyle = getRarityStyle(item.rarity);

  return (
    <article className="group overflow-hidden rounded-lg border border-[#eadbc7] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`h-1.5 sm:h-2 ${rarityStyle.bar}`} />

      <div className="relative bg-[#f8efe3] p-2 sm:p-3">
        <div className="aspect-[4/3] overflow-hidden rounded-lg bg-white">
          {item.imageUrl ? (
            item.imageUrl.startsWith("data:") || item.imageUrl.startsWith("blob:") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.foodName}
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={item.imageUrl}
                alt={item.foodName}
                width={640}
                height={480}
                className="h-full w-full object-cover"
                unoptimized
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#b3a390]">
              <LibraryBig size={28} />
            </div>
          )}
        </div>

        <div className="absolute left-4 top-4 rounded bg-white/95 px-1.5 py-1 text-[10px] font-black shadow-sm sm:left-6 sm:top-6 sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm">
          #{stableDexNumber(item.foodName)}
        </div>

        <div
          className={`absolute right-4 top-4 rounded px-1.5 py-1 text-[10px] font-black shadow-sm sm:right-6 sm:top-6 sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm ${rarityStyle.badge}`}
        >
          {item.rarity}
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-black leading-tight sm:text-xl">{item.foodName}</h3>
          </div>
          <p className="shrink-0 rounded bg-[#231f20] px-2 py-1 text-[10px] font-bold text-white sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm">
            x{item.count}
          </p>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
          <div className="rounded-lg bg-[#f8efe3] p-2 sm:p-3">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-[#766b60] sm:gap-2 sm:text-sm">
              <Flame size={12} />
              Avg kcal
            </div>
            <p className="mt-0.5 text-xs font-black sm:mt-1 sm:text-lg">
              {item.avgKcalMin}-{item.avgKcalMax}
            </p>
          </div>
          <div className="rounded-lg bg-[#f8efe3] p-2 sm:p-3">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-[#766b60] sm:gap-2 sm:text-sm">
              <Sparkles size={12} />
              Last seen
            </div>
            <p className="mt-0.5 text-[10px] font-bold sm:mt-1 sm:text-sm">{formatDateTime(item.lastSeenAt)}</p>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1 sm:mt-3 sm:gap-2">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-[#d9f3ea] px-1.5 py-0.5 text-[10px] font-bold text-[#0f766e] sm:rounded-lg sm:px-2.5 sm:py-1 sm:text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function DexMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-[70px] px-3 py-3 text-center sm:min-w-[88px] sm:px-5 sm:py-4">
      <p className="text-xl font-black sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#766b60] sm:mt-1 sm:text-xs">
        {label}
      </p>
    </div>
  );
}

function getRarityStyle(rarity: Rarity): {
  bar: string;
  badge: string;
} {
  if (rarity === "SSR") {
    return {
      bar: "bg-[#ef4444]",
      badge: "bg-[#fee2e2] text-[#b91c1c]",
    };
  }

  if (rarity === "SR") {
    return {
      bar: "bg-[#f97316]",
      badge: "bg-[#ffedd5] text-[#c2410c]",
    };
  }

  if (rarity === "R") {
    return {
      bar: "bg-[#0f766e]",
      badge: "bg-[#d9f3ea] text-[#0f766e]",
    };
  }

  return {
    bar: "bg-[#b3a390]",
    badge: "bg-[#f8efe3] text-[#665f56]",
  };
}

function stableDexNumber(foodName: string): string {
  const value =
    foodName.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0) %
      900 +
    100;

  return String(value);
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
