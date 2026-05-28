"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Camera, Flame, PackageOpen, Sparkles, Utensils } from "lucide-react";
import type { GeneratedPet } from "@/types";
import { getPetWarehouseItems } from "@/lib/storage";

export default function PetWarehousePage() {
  const [pets, setPets] = useState<GeneratedPet[]>([]);

  useEffect(() => {
    setPets(getPetWarehouseItems());
  }, []);

  const stats = useMemo(() => {
    const sourceFoods = pets.reduce((sum, pet) => sum + pet.sourceFoodNames.length, 0);
    const totalKcalMax = pets.reduce((sum, pet) => sum + pet.kcalMax, 0);
    const tags = new Set(pets.flatMap((pet) => pet.tags));

    return {
      sourceFoods,
      totalKcalMax,
      tagCount: tags.size,
    };
  }, [pets]);

  return (
    <main className="min-h-screen bg-[#fffaf3] text-[#231f20]">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:gap-7 sm:px-8 sm:py-6 lg:px-10">
        <header className="flex flex-col gap-3 border-b border-[#eadbc7] pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-5">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f766e]"
            >
              <ArrowLeft size={18} />
              Dashboard
            </Link>
            <p className="mt-3 text-sm font-bold uppercase tracking-wider text-[#0f766e]">
              Pet Collection
            </p>
            <h1 className="mt-1 text-2xl font-black sm:text-4xl">宠物仓库</h1>
          </div>

          <Link
            href="/capture"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f766e] px-4 py-2.5 text-sm font-bold text-white shadow-sm"
          >
            <Camera size={18} />
            Feed More
          </Link>
        </header>

        <section className="overflow-hidden rounded-lg border border-[#eadbc7] bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1fr_420px]">
            <div className="p-5 sm:p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#d9f3ea] text-[#0f766e]">
                <PackageOpen size={26} />
              </div>
              <h2 className="mt-4 text-2xl font-black sm:text-3xl">
                Every 3 food cards unlock one mini pet.
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#665f56] sm:text-base sm:leading-7">
                The newest three food cards are turned into an AI-generated
                collectible pet. Each pet keeps the food names, nutrition mood,
                and card identity as its memory.
              </p>
            </div>
            <div className="grid grid-cols-3 border-t border-[#eadbc7] lg:border-l lg:border-t-0">
              <WarehouseMetric label="Pets" value={pets.length} />
              <WarehouseMetric label="Foods" value={stats.sourceFoods} />
              <WarehouseMetric label="Tags" value={stats.tagCount} />
            </div>
          </div>
        </section>

        {pets.length === 0 ? (
          <section className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-[#d5c2aa] bg-white p-6 text-center shadow-sm">
            <PackageOpen size={42} className="text-[#0f766e]" />
            <h2 className="mt-4 text-2xl font-black">No warehouse pets yet</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#766b60]">
              Add three food cards from the capture page. The third card will
              trigger AI and unlock your first generated pet.
            </p>
            <Link
              href="/capture"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#231f20] px-4 py-2.5 text-sm font-bold text-white"
            >
              <Camera size={18} />
              Start Feeding
            </Link>
          </section>
        ) : (
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {pets.map((pet) => (
              <GeneratedPetCard key={pet.id} pet={pet} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function GeneratedPetCard({ pet }: { pet: GeneratedPet }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-[#eadbc7] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative bg-[#d9f3ea] p-3">
        <div className="aspect-square overflow-hidden rounded-lg bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pet.imageUrl}
            alt={pet.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        </div>
        <div className="absolute left-6 top-6 rounded-lg bg-white/95 px-3 py-2 text-sm font-black shadow-sm">
          #{String(pet.generationIndex).padStart(3, "0")}
        </div>
        <div className="absolute right-6 top-6 rounded-lg bg-[#231f20] px-3 py-2 text-sm font-black text-white shadow-sm">
          AI Pet
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[#0f766e]">
          {pet.title}
        </p>
        <h2 className="mt-1 text-2xl font-black leading-tight">{pet.name}</h2>
        <p className="mt-2 text-sm font-semibold text-[#3b3430]">{pet.mood}</p>
        <p className="mt-2 text-sm leading-6 text-[#665f56]">{pet.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MiniInfo icon={<Flame size={15} />} label="Food kcal" value={`${pet.kcalMin}-${pet.kcalMax}`} />
          <MiniInfo icon={<Sparkles size={15} />} label="Trait" value={pet.trait} />
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#766b60]">
            <Utensils size={14} />
            Born from
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {pet.sourceFoodNames.map((name) => (
              <span
                key={name}
                className="rounded-lg bg-[#f8efe3] px-2.5 py-1 text-xs font-bold text-[#665f56]"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs font-semibold text-[#85786c]">
          Created {formatDateTime(pet.createdAt)}
        </p>
      </div>
    </article>
  );
}

function WarehouseMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-h-[120px] flex-col items-center justify-center px-4 py-5 text-center">
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#766b60]">
        {label}
      </p>
    </div>
  );
}

function MiniInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-lg bg-[#f8efe3] p-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-[#766b60]">
        {icon}
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-black">{value}</p>
    </div>
  );
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
