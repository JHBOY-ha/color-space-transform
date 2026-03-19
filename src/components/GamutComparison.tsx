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

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-2">
        {Object.entries(COLOR_SPACES).map(([key, cs]) => (
          <label
            key={key}
            className="metric-card flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-200 transition hover:border-sky-400/25 hover:bg-slate-900/70"
          >
            <input
              type="checkbox"
              checked={selectedGamuts.includes(key)}
              onChange={() => onToggleGamut(key)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900/80"
            />
            <span
              className="h-3 w-3 flex-shrink-0 rounded-full"
              style={{ backgroundColor: GAMUT_COLORS[key] || "#888" }}
            />
            <span className="truncate">{cs.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
