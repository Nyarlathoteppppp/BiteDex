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
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-[#eadbc7] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f766e]"
            >
              <ArrowLeft size={18} />
              Dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-bold">Food Dex</h1>
          </div>

          <Link
            href="/capture"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white shadow-sm"
          >
            <Camera size={18} />
            Upload
          </Link>
        </header>

        <section className="overflow-hidden rounded-lg border border-[#eadbc7] bg-white shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="p-5">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#0f766e]">
                Collection
              </p>
              <h2 className="mt-1 text-2xl font-bold">
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
          <section className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-[#eadbc7] bg-white p-8 text-center shadow-sm">
            <LibraryBig size={42} className="text-[#0f766e]" />
            <h2 className="mt-4 text-2xl font-bold">No food cards yet</h2>
            <p className="mt-2 max-w-md leading-7 text-[#665f56]">
              Add a card from the capture page and it will appear here as part of
              your BiteDex collection.
            </p>
          </section>
        ) : (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
      <div className={`h-2 ${rarityStyle.bar}`} />

      <div className="relative bg-[#f8efe3] p-3">
        <div className="aspect-[4/3] overflow-hidden rounded-lg bg-white">
          {item.imageUrl ? (
            item.imageUrl.startsWith("data:") || item.imageUrl.startsWith("blob:") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.foodName}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <Image
                src={item.imageUrl}
                alt={item.foodName}
                width={640}
                height={480}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                unoptimized
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#b3a390]">
              <LibraryBig size={34} />
            </div>
          )}
        </div>

        <div className="absolute left-6 top-6 rounded-lg bg-white/95 px-3 py-2 text-sm font-black shadow-sm">
          #{stableDexNumber(item.foodName)}
        </div>

        <div
          className={`absolute right-6 top-6 rounded-lg px-3 py-2 text-sm font-black shadow-sm ${rarityStyle.badge}`}
        >
          {item.rarity}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#0f766e]">
              Collected Food
            </p>
            <h3 className="mt-1 text-2xl font-black leading-tight">{item.foodName}</h3>
          </div>
          <p className="shrink-0 rounded-lg bg-[#231f20] px-3 py-2 text-sm font-bold text-white">
            x{item.count}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-[#f8efe3] p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#766b60]">
              <Flame size={15} />
              Avg kcal
            </div>
            <p className="mt-1 text-lg font-black">
              {item.avgKcalMin}-{item.avgKcalMax}
            </p>
          </div>
          <div className="rounded-lg bg-[#f8efe3] p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#766b60]">
              <Sparkles size={15} />
              Last seen
            </div>
            <p className="mt-1 text-sm font-bold">{formatDateTime(item.lastSeenAt)}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {item.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-[#d9f3ea] px-2.5 py-1 text-xs font-bold text-[#0f766e]"
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
    <div className="min-w-[88px] px-5 py-4 text-center">
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#766b60]">
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
