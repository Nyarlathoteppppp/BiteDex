"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Flame,
  Loader2,
  PackageOpen,
  Sparkles,
  Utensils,
} from "lucide-react";
import type { DexItem, GeneratedPet, PetSourceFood } from "@/types";
import { addGeneratedPet, getDex, getPetWarehouseItems } from "@/lib/storage";
import { generateId } from "@/lib/utils/id";

export default function PetWarehousePage() {
  const [pets, setPets] = useState<GeneratedPet[]>([]);
  const [dexItems, setDexItems] = useState<DexItem[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<DexItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState("");
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    setPets(getPetWarehouseItems());
    setDexItems(Object.values(getDex()));
  }, []);

  const stats = useMemo(() => {
    const sourceFoods = pets.reduce((sum, pet) => sum + pet.sourceFoodNames.length, 0);
    const tags = new Set(pets.flatMap((pet) => pet.tags));
    return { sourceFoods, tagCount: tags.size };
  }, [pets]);

  function toggleSelect(item: DexItem) {
    setSelectedFoods((prev) => {
      const exists = prev.find((f) => f.foodName === item.foodName);
      if (exists) return prev.filter((f) => f.foodName !== item.foodName);
      if (prev.length >= 3) return prev;
      return [...prev, item];
    });
  }

  async function handleGenerate() {
    if (selectedFoods.length !== 3) return;

    setIsGenerating(true);
    setGenStatus("Generating Pokémon-style pet...");

    const foods: PetSourceFood[] = selectedFoods.map((item) => ({
      id: generateId(),
      foodName: item.foodName,
      portion: "1 serving",
      kcalMin: item.avgKcalMin,
      kcalMax: item.avgKcalMax,
      protein: 0,
      carbs: 0,
      fat: 0,
      tags: item.tags,
      rarity: item.rarity,
    }));

    try {
      const generationIndex = pets.length + 1;
      const response = await fetch("/api/generate-pet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foods, generationIndex }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Generation failed");
      }

      const pet: GeneratedPet = payload.data;
      addGeneratedPet(pet);
      setPets((prev) => [pet, ...prev]);
      setSelectedFoods([]);
      setShowSelector(false);
      setGenStatus(`New pet unlocked: ${pet.name}!`);
    } catch (error) {
      setGenStatus(
        error instanceof Error ? `Failed: ${error.message}` : "Generation failed.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fffaf3] text-[#231f20]">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:gap-7 sm:px-8 sm:py-6 lg:px-10">
        <header className="flex items-center justify-between border-b border-[#eadbc7] pb-4 sm:pb-5">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f766e]"
            >
              <ArrowLeft size={18} />
              Dashboard
            </Link>
            <h1 className="mt-2 text-2xl font-black sm:mt-3 sm:text-4xl">宠物仓库</h1>
          </div>

          <button
            type="button"
            onClick={() => setShowSelector(!showSelector)}
            disabled={dexItems.length < 3}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f766e] px-3 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50 sm:px-4 sm:text-sm"
          >
            <Sparkles size={16} />
            {showSelector ? "Cancel" : "Generate Pet"}
          </button>
        </header>

        <section className="overflow-hidden rounded-lg border border-[#eadbc7] bg-white shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
            <div className="p-4 sm:p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d9f3ea] text-[#0f766e]">
                <PackageOpen size={22} />
              </div>
              <h2 className="mt-3 text-xl font-black sm:text-2xl">
                Select 3 foods from your Dex to create a pet.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#665f56]">
                Each pet inherits the food attributes and becomes a unique Pokémon-style creature.
              </p>
            </div>
            <div className="grid grid-cols-3 border-t border-[#eadbc7] sm:border-l sm:border-t-0">
              <WarehouseMetric label="Pets" value={pets.length} />
              <WarehouseMetric label="Foods" value={stats.sourceFoods} />
              <WarehouseMetric label="Tags" value={stats.tagCount} />
            </div>
          </div>
        </section>

        {/* Food Selector from Dex */}
        {showSelector && (
          <section className="rounded-lg border-2 border-[#0f766e]/30 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Select 3 Foods from Dex</h3>
              <span className="rounded-lg bg-[#d9f3ea] px-3 py-1 text-sm font-bold text-[#0f766e]">
                {selectedFoods.length} / 3
              </span>
            </div>

            {dexItems.length === 0 ? (
              <p className="mt-4 text-sm text-[#766b60]">
                No food in your Dex yet. Go capture some food first!
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {dexItems.map((item) => {
                  const isSelected = selectedFoods.some(
                    (f) => f.foodName === item.foodName,
                  );
                  return (
                    <button
                      key={item.foodName}
                      type="button"
                      onClick={() => toggleSelect(item)}
                      disabled={!isSelected && selectedFoods.length >= 3}
                      className={`relative overflow-hidden rounded-lg border-2 p-2 text-left transition ${
                        isSelected
                          ? "border-[#0f766e] bg-[#d9f3ea]"
                          : "border-[#eadbc7] bg-white hover:border-[#0f766e]/50"
                      } disabled:opacity-40`}
                    >
                      {isSelected && (
                        <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#0f766e] text-white">
                          <Check size={12} />
                        </div>
                      )}
                      <div className="aspect-square overflow-hidden rounded bg-[#f8efe3]">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt={item.foodName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl">
                            🍽️
                          </div>
                        )}
                      </div>
                      <p className="mt-1.5 truncate text-xs font-bold sm:text-sm">
                        {item.foodName}
                      </p>
                      <p className="text-[10px] text-[#766b60] sm:text-xs">
                        {item.rarity} · {item.avgKcalMin}-{item.avgKcalMax} kcal
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={selectedFoods.length !== 3 || isGenerating}
                className="inline-flex items-center gap-2 rounded-lg bg-[#231f20] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                {isGenerating ? "Generating..." : "Create Pet"}
              </button>
              {genStatus && (
                <p className="text-xs font-medium text-[#665f56] sm:text-sm">{genStatus}</p>
              )}
            </div>
          </section>
        )}

        {/* Pet Collection */}
        {pets.length === 0 && !showSelector ? (
          <section className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed border-[#d5c2aa] bg-white p-6 text-center shadow-sm sm:min-h-[360px]">
            <PackageOpen size={36} className="text-[#0f766e]" />
            <h2 className="mt-4 text-xl font-black sm:text-2xl">No warehouse pets yet</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#766b60]">
              Capture at least 3 foods to your Dex, then click &quot;Generate Pet&quot; to create your first Pokémon-style creature.
            </p>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
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
      <div className="relative bg-[#d9f3ea] p-2 sm:p-3">
        <div className="aspect-square overflow-hidden rounded-lg bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pet.imageUrl}
            alt={pet.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute left-4 top-4 rounded bg-white/95 px-2 py-1 text-[10px] font-black shadow-sm sm:left-6 sm:top-6 sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm">
          #{String(pet.generationIndex).padStart(3, "0")}
        </div>
        <div className="absolute right-4 top-4 rounded bg-[#231f20] px-2 py-1 text-[10px] font-black text-white shadow-sm sm:right-6 sm:top-6 sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm">
          AI Pet
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#0f766e] sm:text-xs">
          {pet.title}
        </p>
        <h2 className="mt-1 text-lg font-black leading-tight sm:text-2xl">{pet.name}</h2>
        <p className="mt-1.5 text-xs font-semibold text-[#3b3430] sm:mt-2 sm:text-sm">{pet.mood}</p>
        <p className="mt-1.5 text-xs leading-5 text-[#665f56] sm:mt-2 sm:text-sm sm:leading-6">{pet.description}</p>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
          <MiniInfo icon={<Flame size={13} />} label="Food kcal" value={`${pet.kcalMin}-${pet.kcalMax}`} />
          <MiniInfo icon={<Sparkles size={13} />} label="Trait" value={pet.trait} />
        </div>

        <div className="mt-3 sm:mt-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#766b60] sm:gap-2 sm:text-xs">
            <Utensils size={12} />
            Born from
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5 sm:mt-2 sm:gap-2">
            {pet.sourceFoodNames.map((name) => (
              <span
                key={name}
                className="rounded bg-[#f8efe3] px-2 py-0.5 text-[10px] font-bold text-[#665f56] sm:rounded-lg sm:px-2.5 sm:py-1 sm:text-xs"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-3 text-[10px] font-semibold text-[#85786c] sm:mt-4 sm:text-xs">
          Created {formatDateTime(pet.createdAt)}
        </p>
      </div>
    </article>
  );
}

function WarehouseMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-h-[80px] flex-col items-center justify-center px-3 py-4 text-center sm:min-h-[120px] sm:px-4 sm:py-5">
      <p className="text-2xl font-black sm:text-3xl">{value}</p>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#766b60] sm:mt-1 sm:text-xs">
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
    <div className="min-w-0 rounded-lg bg-[#f8efe3] p-2 sm:p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#766b60] sm:gap-2 sm:text-xs">
        {icon}
        {label}
      </div>
      <p className="mt-0.5 truncate text-xs font-black sm:mt-1 sm:text-sm">{value}</p>
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
