"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Camera, MessageCircle, PackageOpen } from "lucide-react";
import type { DailyLog, FoodCard, PetDialogue, PetState } from "@/types";
import {
  calculateDailyTotal,
  computePetState,
  generatePetDialogue,
} from "@/lib/nutrition";
import { getTodayLog } from "@/lib/storage";

type PetMessage = {
  food: FoodCard;
  petState: PetState;
  dialogue: PetDialogue;
  kcalRange: string;
};

export default function PetPage() {
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);

  useEffect(() => {
    setTodayLog(getTodayLog());
  }, []);

  const messages = useMemo(() => {
    if (!todayLog) {
      return [];
    }

    return todayLog.foods.map<PetMessage>((food, index) => {
      const foodsSoFar = todayLog.foods.slice(0, index + 1);
      const petState = computePetState(foodsSoFar);
      const dialogue = generatePetDialogue(petState, foodsSoFar);
      const total = calculateDailyTotal(foodsSoFar);

      return {
        food,
        petState,
        dialogue,
        kcalRange: `${total.kcalMin}-${total.kcalMax} kcal`,
      };
    });
  }, [todayLog]);

  if (!todayLog) {
    return (
      <main className="min-h-screen bg-[#fffaf3] px-4 py-5 text-[#231f20]">
        <div className="mx-auto max-w-6xl rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
          Loading pet room...
        </div>
      </main>
    );
  }

  const currentPet = todayLog.petState;
  const latestMessage = messages[messages.length - 1];

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
            <h1 className="mt-2 text-2xl font-bold sm:mt-3 sm:text-3xl">Pet Room</h1>
          </div>

          <div className="flex gap-2">
            <Link
              href="/pet-warehouse"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#e4d3be] bg-white px-3 py-2 text-xs font-semibold shadow-sm sm:gap-2 sm:px-4 sm:text-sm"
            >
              <PackageOpen size={16} />
              Box
            </Link>
            <Link
              href="/capture"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0f766e] px-3 py-2 text-xs font-semibold text-white shadow-sm sm:gap-2 sm:px-4 sm:text-sm"
            >
              <Camera size={16} />
              Feed
            </Link>
          </div>
        </header>

        <section className="overflow-hidden rounded-lg border border-[#eadbc7] bg-white shadow-sm">
          <div className="grid lg:grid-cols-[320px_1fr]">
            <div className="flex flex-col items-center justify-center bg-[#d9f3ea] p-5 sm:p-6">
              <PetImage src={currentPet.imageUrl} title={currentPet.title} />
              <p className="mt-3 rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-[#0f766e] shadow-sm sm:mt-4 sm:px-4 sm:py-2">
                {currentPet.title}
              </p>
            </div>

            <div className="p-4 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#0f766e] sm:text-sm">
                Current Mood
              </p>
              <h2 className="mt-1.5 text-xl font-bold sm:mt-2 sm:text-3xl">
                {latestMessage
                  ? `I just tasted ${latestMessage.food.foodName}`
                  : "I am waiting for today's first bite"}
              </h2>
              <p className="mt-2 max-w-2xl text-base font-semibold leading-7 text-[#3b3430] sm:mt-3 sm:text-lg sm:leading-8">
                {todayLog.dialogue.message}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-3">
                <MiniMetric label="Cards" value={todayLog.total.records} />
                <MiniMetric
                  label="Calories"
                  value={`${todayLog.total.kcalMin}-${todayLog.total.kcalMax}`}
                />
                <MiniMetric label="Protein" value={`${todayLog.total.protein}g`} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#eadbc7] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-[#0f766e]" />
            <h2 className="text-lg font-bold sm:text-xl">Feeding Chat</h2>
          </div>

          {messages.length === 0 ? (
            <div className="mt-4 flex min-h-[200px] flex-col items-center justify-center rounded-lg bg-[#f8efe3] p-5 text-center text-[#766b60] sm:min-h-[300px] sm:p-6">
              <MessageCircle size={32} />
              <p className="mt-3 text-sm font-semibold">No pet replies yet.</p>
              <p className="mt-1 max-w-md text-xs leading-5 sm:text-sm sm:leading-7">
                Upload a food photo, add it to today, and your pet will answer
                here in a chat bubble.
              </p>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-4 sm:mt-5 sm:gap-5">
              {messages.map((message) => (
                <FeedingTurn key={message.food.id} message={message} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function FeedingTurn({ message }: { message: PetMessage }) {
  return (
    <article className="flex flex-col gap-2 sm:gap-3">
      <div className="ml-auto flex max-w-[90%] items-center gap-2 rounded-lg bg-[#0f766e] p-2.5 text-white sm:max-w-[760px] sm:gap-3 sm:p-3">
        <FoodThumb src={message.food.imageUrl} name={message.food.foodName} />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold opacity-80 sm:text-sm">{message.food.time}</p>
          <p className="truncate text-sm font-bold sm:text-base">I feed you {message.food.foodName}</p>
          <p className="text-xs opacity-90 sm:text-sm">
            {message.food.kcalMin}-{message.food.kcalMax} kcal · Score{" "}
            {message.food.biteScore}
          </p>
        </div>
      </div>

      <div className="mr-auto grid max-w-[95%] grid-cols-[48px_1fr] gap-2 sm:max-w-[820px] sm:grid-cols-[64px_1fr] sm:gap-3">
        <div className="h-12 w-12 rounded-lg bg-[#d9f3ea] p-1 sm:h-16 sm:w-16 sm:p-1.5">
          <PetImage src={message.petState.imageUrl} title={message.petState.title} small />
        </div>
        <div className="rounded-lg bg-[#f8efe3] p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#0f766e] sm:text-sm">
              {message.petState.title}
            </p>
            <p className="text-[11px] font-semibold text-[#766b60] sm:text-sm">
              {message.kcalRange}
            </p>
          </div>
          <p className="mt-1.5 text-sm font-bold leading-6 sm:mt-2 sm:text-lg sm:leading-8">
            {message.dialogue.message}
          </p>
          <p className="mt-1.5 text-xs leading-5 text-[#665f56] sm:mt-2 sm:text-base sm:leading-7">{message.dialogue.reason}</p>
          <p className="mt-1.5 text-xs leading-5 text-[#665f56] sm:mt-2 sm:text-base sm:leading-7">
            {message.dialogue.suggestion}
          </p>
        </div>
      </div>
    </article>
  );
}

function PetImage({
  src,
  title,
  small = false,
}: {
  src: string;
  title: string;
  small?: boolean;
}) {
  return (
    <div
      className={`flex aspect-square items-center justify-center rounded-lg bg-white/70 ${
        small ? "h-full w-full p-1" : "w-full max-w-[180px] p-2 shadow-sm sm:max-w-[250px] sm:p-3"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${title} pet`}
        className="h-full w-full object-contain"
        onError={(event) => {
          event.currentTarget.style.display = "none";
          event.currentTarget.nextElementSibling?.classList.remove("hidden");
        }}
      />
      <div className="hidden text-center text-xs font-bold text-[#0f766e]">
        {title}
      </div>
    </div>
  );
}

function FoodThumb({ src, name }: { src: string; name: string }) {
  return (
    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white/20 sm:h-14 sm:w-14">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : null}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-[#f8efe3] p-2.5 sm:p-4">
      <p className="text-[11px] font-medium text-[#766b60] sm:text-sm">{label}</p>
      <p className="mt-0.5 text-base font-bold sm:mt-1 sm:text-2xl">{value}</p>
    </div>
  );
}
