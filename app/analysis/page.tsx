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
      <main className="min-h-screen bg-[#fffaf3] px-4 py-5 text-[#231f20]">
        <div className="mx-auto max-w-6xl rounded-lg border border-[#eadbc7] bg-white p-5 shadow-sm">
          Loading analysis...
        </div>
      </main>
    );
  }

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
            <h1 className="mt-2 text-2xl font-bold sm:mt-3 sm:text-3xl">7-Day Analysis</h1>
          </div>

          <Link
            href="/capture"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0f766e] px-3 py-2 text-xs font-semibold text-white shadow-sm sm:gap-2 sm:px-4 sm:text-sm"
          >
            <Camera size={16} />
            Upload
          </Link>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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
          <section className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-[#eadbc7] bg-white p-6 text-center shadow-sm sm:min-h-[360px] sm:p-8">
            <ChartNoAxesCombined size={36} className="text-[#0f766e]" />
            <h2 className="mt-3 text-xl font-bold sm:mt-4 sm:text-2xl">No trend yet</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#665f56] sm:leading-7">
              Record at least one food card to generate your weekly BiteDex
              analysis.
            </p>
          </section>
        ) : (
          <>
            <section className="grid gap-4 sm:gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border border-[#eadbc7] bg-white p-4 shadow-sm sm:p-5">
                <h2 className="text-lg font-bold sm:text-xl">Weekly Signals</h2>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
                  <Signal label="High Sugar" value={analysis.highSugarDays} />
                  <Signal label="High Fat" value={analysis.highFatDays} />
                  <Signal label="High Protein" value={analysis.highProteinDays} />
                  <Signal
                    label="Highest Day"
                    value={
                      analysis.highestCalorieDay
                        ? `${analysis.highestCalorieDay.kcalMax}`
                        : "—"
                    }
                    sub={analysis.highestCalorieDay?.date.slice(5)}
                  />
                  <Signal
                    label="Lowest Day"
                    value={
                      analysis.lowestCalorieDay
                        ? `${analysis.lowestCalorieDay.kcalMin}`
                        : "—"
                    }
                    sub={analysis.lowestCalorieDay?.date.slice(5)}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-[#eadbc7] bg-white p-4 shadow-sm sm:p-5">
                <h2 className="text-lg font-bold sm:text-xl">Pet State Distribution</h2>
                <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
                  {statusRows.length === 0 ? (
                    <p className="rounded-lg bg-[#f8efe3] p-3 text-sm text-[#766b60] sm:p-4">
                      No pet states recorded yet.
                    </p>
                  ) : (
                    statusRows.map(([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center justify-between rounded-lg bg-[#f8efe3] p-3 sm:p-4"
                      >
                        <p className="text-sm font-semibold sm:text-base">{formatStatus(status)}</p>
                        <p className="text-xs font-bold text-[#0f766e] sm:text-sm">
                          {count} day{count === 1 ? "" : "s"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-[#eadbc7] bg-white p-4 shadow-sm sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#0f766e] sm:text-sm">
                Summary
              </p>
              <h2 className="mt-1.5 text-lg font-bold sm:mt-2 sm:text-2xl">{analysis.summary}</h2>
              <p className="mt-2 text-sm leading-6 text-[#665f56] sm:mt-3 sm:leading-7">{analysis.advice}</p>
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
    <div className="rounded-lg border border-[#eadbc7] bg-white p-3 shadow-sm sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0f766e] sm:text-sm">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold sm:mt-2 sm:text-3xl">
        {value}
        {unit ? <span className="ml-1 text-[10px] font-semibold sm:text-sm">{unit}</span> : null}
      </p>
    </div>
  );
}

function Signal({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-lg bg-[#f8efe3] p-2.5 sm:p-4">
      <p className="text-[11px] font-medium text-[#766b60] sm:text-sm">{label}</p>
      <p className="mt-0.5 text-sm font-bold sm:mt-1 sm:text-base">{value}</p>
      {sub && <p className="text-[10px] text-[#85786c] sm:text-xs">{sub}</p>}
    </div>
  );
}

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}
