"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Camera, LibraryBig } from "lucide-react";
import type { DexItem } from "@/types";
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

        <section className="rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#0f766e]">
                Collection
              </p>
              <h2 className="mt-1 text-2xl font-bold">
                {items.length} collected foods
              </h2>
            </div>
            <p className="text-sm font-medium text-[#766b60]">
              Cards are merged by food name from localStorage.
            </p>
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
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
  return (
    <article className="overflow-hidden rounded-lg border border-[#eadbc7] bg-white shadow-sm">
      <div className="aspect-[4/3] bg-[#f8efe3]">
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
        ) : null}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#0f766e]">
              {item.rarity} · Seen {item.count}x
            </p>
            <h3 className="mt-1 text-xl font-bold">{item.foodName}</h3>
          </div>
          <p className="rounded-lg bg-[#f8efe3] px-3 py-2 text-sm font-bold">
            {item.avgKcalMin}-{item.avgKcalMax}
          </p>
        </div>

        <p className="mt-3 text-sm text-[#766b60]">
          Last seen {formatDateTime(item.lastSeenAt)}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {item.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-[#d9f3ea] px-2 py-1 text-xs font-semibold text-[#0f766e]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
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

