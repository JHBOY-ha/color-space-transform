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
    <div className="bg-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">色域对比</h3>
      <div className="grid grid-cols-2 gap-1.5">
        {Object.entries(COLOR_SPACES).map(([key, cs]) => (
          <label
            key={key}
            className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:bg-slate-700/50 rounded px-2 py-1"
          >
            <input
              type="checkbox"
              checked={selectedGamuts.includes(key)}
              onChange={() => onToggleGamut(key)}
              className="rounded border-slate-600"
            />
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: GAMUT_COLORS[key] || "#888" }}
            />
            <span className="truncate">{cs.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
