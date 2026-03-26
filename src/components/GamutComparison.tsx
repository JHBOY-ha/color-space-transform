"use client";

import { COLOR_SPACES, GAMUT_COLORS } from "@/lib/colorData";

interface GamutComparisonProps {
  selectedGamuts: string[];
  onToggleGamut: (spaceKey: string) => void;
}

export default function GamutComparison({
  selectedGamuts,
  onToggleGamut,
}: GamutComparisonProps) {
  return (
    <div className="app-panel rounded-[24px] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="app-kicker text-[11px] font-semibold">Compare</p>
          <h3 className="mt-1 text-lg font-semibold text-white">色域对比</h3>
        </div>
        <div className="rounded-full border border-slate-700/70 bg-slate-950/35 px-3 py-1 text-xs font-medium text-slate-300">
          已选 {selectedGamuts.length}
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {Object.entries(COLOR_SPACES).map(([key, cs]) => (
          <button
            key={key}
            type="button"
            aria-pressed={selectedGamuts.includes(key)}
            onClick={() => onToggleGamut(key)}
            className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2 text-sm transition ${
              selectedGamuts.includes(key)
                ? "border-sky-400/35 bg-sky-400/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                : "border-slate-800/80 bg-slate-950/22 text-slate-300 hover:border-sky-400/25 hover:bg-slate-900/70"
            }`}
          >
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: GAMUT_COLORS[key] || "#888" }}
            />
            <span className="truncate text-left">{cs.name}</span>
            <span
              className={`ml-auto h-2 w-2 rounded-full ${
                selectedGamuts.includes(key) ? "bg-sky-300" : "bg-slate-600"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
