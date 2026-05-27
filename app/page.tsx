import Link from "next/link";
import { Camera, ChartNoAxesCombined, LibraryBig } from "lucide-react";
import { buildDailyLog } from "@/lib/nutrition";
import { sampleTodayFoods } from "@/lib/mock/cards";

const todayLog = buildDailyLog("2026-05-28", sampleTodayFoods);

export default function Home() {
  const { total, petState, dialogue, highlights, foods } = todayLog;

  return (
    <main className="min-h-screen bg-[#fffaf3] text-[#231f20]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-[#eadbc7] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#0f766e]">
              BiteDex MVP
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-normal">一口图鉴</h1>
          </div>

          <nav className="flex flex-wrap gap-2">
            <Link
              href="/capture"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white shadow-sm"
            >
              <Camera size={18} />
              Upload
            </Link>
            <Link
              href="/dex"
              className="inline-flex items-center gap-2 rounded-lg border border-[#e4d3be] bg-white px-4 py-2 text-sm font-semibold"
            >
              <LibraryBig size={18} />
              Dex
            </Link>
            <Link
              href="/analysis"
              className="inline-flex items-center gap-2 rounded-lg border border-[#e4d3be] bg-white px-4 py-2 text-sm font-semibold"
            >
              <ChartNoAxesCombined size={18} />
              Analysis
            </Link>
          </nav>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-[220px_1fr] sm:items-center">
              <div className="flex aspect-square items-center justify-center rounded-lg bg-[#d9f3ea]">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#0f766e] text-center text-sm font-bold text-white">
                  {petState.title}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-[#0f766e]">
                  Pet Status
                </p>
                <h2 className="mt-2 text-3xl font-bold">{dialogue.title}</h2>
                <p className="mt-3 text-lg font-semibold text-[#3b3430]">
                  {dialogue.message}
                </p>
                <p className="mt-2 leading-7 text-[#665f56]">{dialogue.reason}</p>
                <p className="mt-2 leading-7 text-[#665f56]">
                  {dialogue.suggestion}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#0f766e]">
              Today Summary
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric label="Records" value={String(total.records)} />
              <Metric label="Calories" value={`${total.kcalMin}-${total.kcalMax}`} unit="kcal" />
              <Metric label="Protein" value={String(total.protein)} unit="g" />
              <Metric label="Carbs" value={String(total.carbs)} unit="g" />
              <Metric label="Fat" value={String(total.fat)} unit="g" />
              <Metric label="State" value={petState.title} />
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold">Today Highlights</h2>
            <div className="mt-4 space-y-3">
              <Highlight
                label="Highest Calorie"
                name={highlights.highestCalorie?.foodName}
                value={
                  highlights.highestCalorie
                    ? `${highlights.highestCalorie.kcalMin}-${highlights.highestCalorie.kcalMax} kcal`
                    : "No data"
                }
              />
              <Highlight
                label="Highest Protein"
                name={highlights.highestProtein?.foodName}
                value={
                  highlights.highestProtein
                    ? `${highlights.highestProtein.protein}g protein`
                    : "No data"
                }
              />
              <Highlight
                label="Calorie Assassin"
                name={highlights.calorieAssassin?.foodName}
                value={
                  highlights.calorieAssassin
                    ? `${highlights.calorieAssassin.kcalMax} kcal max`
                    : "No data"
                }
              />
            </div>
          </div>

          <div className="rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold">Today Timeline</h2>
            <div className="mt-4 divide-y divide-[#f0e3d2]">
              {foods.map((food) => (
                <div
                  key={food.id}
                  className="grid grid-cols-[56px_1fr_auto] items-center gap-3 py-3"
                >
                  <div className="text-sm font-semibold text-[#85786c]">{food.time}</div>
                  <div>
                    <p className="font-semibold">{food.foodName}</p>
                    <p className="mt-1 text-sm text-[#766b60]">
                      {food.portion} · {food.mealType} · {food.rarity}
                    </p>
                  </div>
                  <div className="text-right text-sm font-semibold">
                    {food.kcalMin}-{food.kcalMax} kcal
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-lg bg-[#f8efe3] p-4">
      <p className="text-sm font-medium text-[#766b60]">{label}</p>
      <p className="mt-1 text-2xl font-bold">
        {value}
        {unit ? <span className="ml-1 text-sm font-semibold">{unit}</span> : null}
      </p>
    </div>
  );
}

function Highlight({
  label,
  name,
  value,
}: {
  label: string;
  name?: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-[#f8efe3] p-4">
      <p className="text-sm font-medium text-[#766b60]">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="font-semibold">{name ?? "None"}</p>
        <p className="text-sm font-semibold text-[#0f766e]">{value}</p>
      </div>
    </div>
  );
}
