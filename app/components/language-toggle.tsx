"use client";

import type { Language } from "@/lib/i18n";

export function LanguageToggle({
  language,
  onChange,
}: {
  language: Language;
  onChange: (next: Language) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-[#e4d3be] bg-white p-1">
      <button
        type="button"
        onClick={() => onChange("zh")}
        className={`rounded px-2.5 py-1 text-xs font-semibold sm:text-sm ${
          language === "zh" ? "bg-[#0f766e] text-white" : "text-[#665f56]"
        }`}
      >
        中文
      </button>
      <button
        type="button"
        onClick={() => onChange("en")}
        className={`rounded px-2.5 py-1 text-xs font-semibold sm:text-sm ${
          language === "en" ? "bg-[#0f766e] text-white" : "text-[#665f56]"
        }`}
      >
        EN
      </button>
    </div>
  );
}
