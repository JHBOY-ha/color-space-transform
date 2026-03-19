"use client";

import { useState } from "react";
import { COLOR_SPACES, WHITE_POINTS } from "@/lib/colorData";
import { toDisplayRGB, rgbToXyz, xyzToRgb } from "@/lib/colorConvert";
import ColorSwatch from "./ColorSwatch";

interface InputPanelProps {
  rgb: [number, number, number]; // 0-1 range
  srcSpace: string;
  whitePoint: string;
  inputMode: "255" | "float";
  onRGBChange: (rgb: [number, number, number]) => void;
  onSrcSpaceChange: (space: string) => void;
  onWhitePointChange: (wp: string) => void;
  onInputModeChange: (mode: "255" | "float") => void;
}

export default function InputPanel({
  rgb,
  srcSpace,
  whitePoint,
  inputMode,
  onRGBChange,
  onSrcSpaceChange,
  onWhitePointChange,
  onInputModeChange,
}: InputPanelProps) {
  const channels = ["R", "G", "B"] as const;
  const channelColors = ["#ef4444", "#22c55e", "#3b82f6"];

  const handleChannelChange = (index: number, rawValue: number) => {
    const newRgb: [number, number, number] = [...rgb];
    newRgb[index] = inputMode === "255" ? rawValue / 255 : rawValue;
    newRgb[index] = Math.max(0, Math.min(1, newRgb[index]));
    onRGBChange(newRgb);
  };

  const handleHexChange = (hex: string) => {
    const cleaned = hex.replace("#", "");
    if (cleaned.length === 6) {
      const r = parseInt(cleaned.slice(0, 2), 16) / 255;
      const g = parseInt(cleaned.slice(2, 4), 16) / 255;
      const b = parseInt(cleaned.slice(4, 6), 16) / 255;
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        if (srcSpace === "sRGB") {
          onRGBChange([r, g, b]);
        } else {
          // Convert sRGB hex → XYZ → current space
          const xyz = rgbToXyz(r, g, b, "sRGB");
          const result = xyzToRgb(xyz[0], xyz[1], xyz[2], srcSpace);
          onRGBChange([result.r, result.g, result.b]);
        }
      }
    }
  };

  const displayValue = (v: number): string => {
    if (inputMode === "255") return Math.round(v * 255).toString();
    return v.toFixed(4);
  };

  // Always display sRGB hex
  const [dr, dg, db] = toDisplayRGB(rgb[0], rgb[1], rgb[2], srcSpace);
  const hexValue =
    "#" +
    [dr, dg, db]
      .map((v) =>
        Math.max(0, Math.min(255, v))
          .toString(16)
          .padStart(2, "0")
      )
      .join("");
  const normalizedHexValue = hexValue.toUpperCase();
  const [hexInput, setHexInput] = useState<string | null>(null);
  const [isHexFocused, setIsHexFocused] = useState(false);
  const displayedHexValue = isHexFocused ? (hexInput ?? normalizedHexValue) : normalizedHexValue;

  return (
    <div className="app-panel flex flex-col gap-4 rounded-[24px] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="app-kicker text-[11px] font-semibold">Input</p>
          <h2 className="mt-1 text-lg font-semibold text-white">输入 RGB</h2>
        </div>
        <div className="rounded-full border border-slate-700/70 bg-slate-950/35 px-3 py-1 text-xs font-medium text-slate-300">
          {inputMode === "255" ? "0-255" : "0.0-1.0"}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <div className="metric-card p-4">
          <label htmlFor="src-space" className="mb-2 block text-sm text-slate-400">色彩空间</label>
          <select
            id="src-space"
            title="源色彩空间"
            value={srcSpace}
            onChange={(e) => onSrcSpaceChange(e.target.value)}
            className="app-select px-3 py-2 text-sm"
          >
            {Object.entries(COLOR_SPACES).map(([key, cs]) => (
              <option key={key} value={key}>
                {cs.name}
              </option>
            ))}
          </select>
        </div>

        <div className="metric-card p-4">
          <label htmlFor="white-point" className="mb-2 block text-sm text-slate-400">参考白点</label>
          <select
            id="white-point"
            title="参考白点"
            value={whitePoint}
            onChange={(e) => onWhitePointChange(e.target.value)}
            className="app-select px-3 py-2 text-sm"
          >
            {Object.entries(WHITE_POINTS).map(([key, wp]) => (
              <option key={key} value={key}>
                {wp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="metric-card p-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onInputModeChange("255")}
            data-active={inputMode === "255"}
            className="app-toggle rounded-2xl px-4 py-2 text-sm font-medium"
          >
            0 - 255
          </button>
          <button
            type="button"
            onClick={() => onInputModeChange("float")}
            data-active={inputMode === "float"}
            className="app-toggle rounded-2xl px-4 py-2 text-sm font-medium"
          >
            0.0 - 1.0
          </button>
        </div>
      </div>

      <div className="metric-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="section-label">通道控制</p>
          <span className="text-xs text-slate-500">滑块与数值同步</span>
        </div>

        {channels.map((ch, i) => (
          <div
            key={ch}
            className={`grid grid-cols-[28px_minmax(0,1fr)_68px] items-center gap-3 py-2 ${
              i < channels.length - 1 ? "border-b border-slate-800/80" : ""
            }`}
          >
            <label htmlFor={`channel-${ch}`} className="text-sm font-semibold" style={{ color: channelColors[i] }}>
              {ch}
            </label>
            <input
              type="range"
              title={`${ch} 通道滑块`}
              min={0}
              max={inputMode === "255" ? 255 : 1}
              step={inputMode === "255" ? 1 : 0.001}
              value={inputMode === "255" ? Math.round(rgb[i] * 255) : rgb[i]}
              onChange={(e) => handleChannelChange(i, parseFloat(e.target.value))}
              className="app-range h-2 w-full cursor-pointer rounded-full appearance-none"
              style={{
                background: `linear-gradient(90deg, rgba(15, 23, 42, 0.96), ${channelColors[i]})`,
              }}
            />
            <div className="flex flex-col items-end gap-1">
              <span className="font-mono text-xs text-slate-300">
                {displayValue(rgb[i])}
              </span>
              <input
                id={`channel-${ch}`}
                type="number"
                title={`${ch} 通道值`}
                min={0}
                max={inputMode === "255" ? 255 : 1}
                step={inputMode === "255" ? 1 : 0.0001}
                value={inputMode === "255" ? Math.round(rgb[i] * 255) : parseFloat(rgb[i].toFixed(4))}
                onChange={(e) => handleChannelChange(i, parseFloat(e.target.value) || 0)}
                className="app-field px-2 py-1.5 text-right text-xs font-mono"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px] xl:grid-cols-1">
        <div className="metric-card p-4">
          <label htmlFor="hex-input" className="mb-2 block text-sm text-slate-400">Hex (sRGB)</label>
          <input
            id="hex-input"
            type="text"
            title="sRGB Hex 颜色值"
            placeholder="#000000"
            value={displayedHexValue}
            onFocus={() => {
              setIsHexFocused(true);
              setHexInput(normalizedHexValue);
            }}
            onBlur={() => {
              setIsHexFocused(false);
              setHexInput(null);
            }}
            onChange={(e) => {
              const nextValue = e.target.value.toUpperCase();
              setHexInput(nextValue);
              handleHexChange(nextValue);
            }}
            className="app-field px-3 py-2 text-sm font-mono"
            maxLength={7}
          />
        </div>

        <div className="metric-card flex justify-center p-3">
          <ColorSwatch r={dr} g={dg} b={db} label="预览" />
        </div>
      </div>
    </div>
  );
}
