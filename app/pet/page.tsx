"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Camera, MessageCircle } from "lucide-react";
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
      <main className="min-h-screen bg-[#fffaf3] px-5 py-6 text-[#231f20]">
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
            <h1 className="mt-3 text-3xl font-bold">Pet Room</h1>
          </div>

          <Link
            href="/capture"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white shadow-sm"
          >
            <Camera size={18} />
            Feed Food
          </Link>
        </header>

        <section className="overflow-hidden rounded-lg border border-[#eadbc7] bg-white shadow-sm">
          <div className="grid lg:grid-cols-[320px_1fr]">
            <div className="flex flex-col items-center justify-center bg-[#d9f3ea] p-6">
              <PetImage src={currentPet.imageUrl} title={currentPet.title} />
              <p className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#0f766e] shadow-sm">
                {currentPet.title}
              </p>
            </div>

            <div className="p-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#0f766e]">
                Current Mood
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                {latestMessage
                  ? `I just tasted ${latestMessage.food.foodName}`
                  : "I am waiting for today's first bite"}
              </h2>
              <p className="mt-3 max-w-2xl text-lg font-semibold leading-8 text-[#3b3430]">
                {todayLog.dialogue.message}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <MiniMetric label="Food Cards" value={todayLog.total.records} />
                <MiniMetric
                  label="Calories"
                  value={`${todayLog.total.kcalMin}-${todayLog.total.kcalMax}`}
                />
                <MiniMetric label="Protein" value={`${todayLog.total.protein}g`} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-[#0f766e]" />
            <h2 className="text-xl font-bold">Feeding Chat</h2>
          </div>

          {messages.length === 0 ? (
            <div className="mt-5 flex min-h-[300px] flex-col items-center justify-center rounded-lg bg-[#f8efe3] p-6 text-center text-[#766b60]">
              <MessageCircle size={38} />
              <p className="mt-3 font-semibold">No pet replies yet.</p>
              <p className="mt-1 max-w-md leading-7">
                Upload a food photo, add it to today, and your pet will answer
                here in a chat bubble.
              </p>
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-5">
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
    <article className="flex flex-col gap-3">
      <div className="ml-auto flex max-w-[760px] items-center gap-3 rounded-lg bg-[#0f766e] p-3 text-white">
        <FoodThumb src={message.food.imageUrl} name={message.food.foodName} />
        <div>
          <p className="text-sm font-semibold opacity-80">{message.food.time}</p>
          <p className="font-bold">I feed you {message.food.foodName}</p>
          <p className="text-sm opacity-90">
            {message.food.kcalMin}-{message.food.kcalMax} kcal · Bite Score{" "}
            {message.food.biteScore}
          </p>
        </div>
      </div>

      <div className="mr-auto grid max-w-[820px] grid-cols-[64px_1fr] gap-3">
        <div className="h-16 w-16 rounded-lg bg-[#d9f3ea] p-1.5">
          <PetImage src={message.petState.imageUrl} title={message.petState.title} small />
        </div>
        <div className="rounded-lg bg-[#f8efe3] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold uppercase tracking-wider text-[#0f766e]">
              {message.petState.title}
            </p>
            <p className="text-sm font-semibold text-[#766b60]">
              Today so far: {message.kcalRange}
            </p>
          </div>
          <p className="mt-2 text-lg font-bold leading-8">
            {message.dialogue.message}
          </p>
          <p className="mt-2 leading-7 text-[#665f56]">{message.dialogue.reason}</p>
          <p className="mt-2 leading-7 text-[#665f56]">
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
        small ? "h-full w-full p-1" : "w-full max-w-[250px] p-3 shadow-sm"
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
    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white/20">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : null}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-[#f8efe3] p-4">
      <p className="text-sm font-medium text-[#766b60]">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
