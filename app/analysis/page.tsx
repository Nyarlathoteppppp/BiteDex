"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Camera, ChartNoAxesCombined } from "lucide-react";
import type { SevenDayAnalysis } from "@/types";
import { getSevenDayAnalysis } from "@/lib/nutrition";
import { getDailyLogs } from "@/lib/storage";

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<SevenDayAnalysis | null>(null);

  useEffect(() => {
    setAnalysis(getSevenDayAnalysis(getDailyLogs()));
  }, []);

  const statusRows = useMemo(() => {
    if (!analysis) {
      return [];
    }

    return Object.entries(analysis.petStatusDistribution).filter(
      ([, count]) => count > 0,
    );
  }, [analysis]);

  if (!analysis) {
    return (
      <main className="min-h-screen bg-[#fffaf3] px-5 py-6 text-[#231f20]">
        <div className="mx-auto max-w-6xl rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
          Loading analysis...
        </div>
      </main>
    );
  }

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
            <h1 className="mt-3 text-3xl font-bold">7-Day Analysis</h1>
          </div>

          <Link
            href="/capture"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white shadow-sm"
          >
            <Camera size={18} />
            Upload
          </Link>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Recorded Days" value={analysis.recordedDays} />
          <Metric label="Food Cards" value={analysis.foodCards} />
          <Metric
            label="Avg Calories"
            value={`${analysis.averageDailyKcalMin}-${analysis.averageDailyKcalMax}`}
            unit="kcal"
          />
          <Metric label="Overload Days" value={analysis.overloadedDays} />
        </section>

        {analysis.recordedDays === 0 ? (
          <section className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-[#eadbc7] bg-white p-8 text-center shadow-sm">
            <ChartNoAxesCombined size={42} className="text-[#0f766e]" />
            <h2 className="mt-4 text-2xl font-bold">No trend yet</h2>
            <p className="mt-2 max-w-md leading-7 text-[#665f56]">
              Record at least one food card to generate your weekly BiteDex
              analysis.
            </p>
          </section>
        ) : (
          <>
            <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold">Weekly Signals</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Signal label="High Sugar Days" value={analysis.highSugarDays} />
                  <Signal label="High Fat Days" value={analysis.highFatDays} />
                  <Signal label="High Protein Days" value={analysis.highProteinDays} />
                  <Signal
                    label="Highest Day"
                    value={
                      analysis.highestCalorieDay
                        ? `${analysis.highestCalorieDay.date} · ${analysis.highestCalorieDay.kcalMax} kcal`
                        : "No data"
                    }
                  />
                  <Signal
                    label="Lowest Day"
                    value={
                      analysis.lowestCalorieDay
                        ? `${analysis.lowestCalorieDay.date} · ${analysis.lowestCalorieDay.kcalMin} kcal`
                        : "No data"
                    }
                  />
                </div>
              </div>

              <div className="rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold">Pet State Distribution</h2>
                <div className="mt-4 space-y-3">
                  {statusRows.length === 0 ? (
                    <p className="rounded-lg bg-[#f8efe3] p-4 text-[#766b60]">
                      No pet states recorded yet.
                    </p>
                  ) : (
                    statusRows.map(([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center justify-between rounded-lg bg-[#f8efe3] p-4"
                      >
                        <p className="font-semibold">{formatStatus(status)}</p>
                        <p className="text-sm font-bold text-[#0f766e]">
                          {count} day{count === 1 ? "" : "s"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#0f766e]">
                Summary
              </p>
              <h2 className="mt-2 text-2xl font-bold">{analysis.summary}</h2>
              <p className="mt-3 leading-7 text-[#665f56]">{analysis.advice}</p>
            </section>
          </>
        )}
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
  value: number | string;
  unit?: string;
}) {
  return (
    <div className="rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wider text-[#0f766e]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold">
        {value}
        {unit ? <span className="ml-1 text-sm font-semibold">{unit}</span> : null}
      </p>
    </div>
  );
}

function Signal({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-[#f8efe3] p-4">
      <p className="text-sm font-medium text-[#766b60]">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

