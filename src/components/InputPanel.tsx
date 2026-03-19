"use client";

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

  return (
    <div className="bg-slate-800 rounded-xl p-5 flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-200">输入 (RGB)</h2>

      {/* Color Space */}
      <div>
        <label htmlFor="src-space" className="text-sm text-slate-400 mb-1 block">色彩空间</label>
        <select
          id="src-space"
          title="源色彩空间"
          value={srcSpace}
          onChange={(e) => onSrcSpaceChange(e.target.value)}
          className="w-full bg-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:border-blue-500"
        >
          {Object.entries(COLOR_SPACES).map(([key, cs]) => (
            <option key={key} value={key}>
              {cs.name}
            </option>
          ))}
        </select>
      </div>

      {/* White Point */}
      <div>
        <label htmlFor="white-point" className="text-sm text-slate-400 mb-1 block">参考白点</label>
        <select
          id="white-point"
          title="参考白点"
          value={whitePoint}
          onChange={(e) => onWhitePointChange(e.target.value)}
          className="w-full bg-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:border-blue-500"
        >
          {Object.entries(WHITE_POINTS).map(([key, wp]) => (
            <option key={key} value={key}>
              {wp.name}
            </option>
          ))}
        </select>
      </div>

      {/* Input Mode Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onInputModeChange("255")}
          className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition ${
            inputMode === "255"
              ? "bg-blue-600 text-white"
              : "bg-slate-700 text-slate-400 hover:bg-slate-600"
          }`}
        >
          0 - 255
        </button>
        <button
          type="button"
          onClick={() => onInputModeChange("float")}
          className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition ${
            inputMode === "float"
              ? "bg-blue-600 text-white"
              : "bg-slate-700 text-slate-400 hover:bg-slate-600"
          }`}
        >
          0.0 - 1.0
        </button>
      </div>

      {/* RGB Channels */}
      {channels.map((ch, i) => (
        <div key={ch}>
          <label htmlFor={`channel-${ch}`} className="text-sm font-medium mb-1 flex justify-between">
            <span style={{ color: channelColors[i] }}>{ch}</span>
            <span className="font-mono text-slate-300">{displayValue(rgb[i])}</span>
          </label>
          <input
            type="range"
            title={`${ch} 通道滑块`}
            min={0}
            max={inputMode === "255" ? 255 : 1}
            step={inputMode === "255" ? 1 : 0.001}
            value={inputMode === "255" ? Math.round(rgb[i] * 255) : rgb[i]}
            onChange={(e) => handleChannelChange(i, parseFloat(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #1e293b, ${channelColors[i]})`,
            }}
          />
          <input
            id={`channel-${ch}`}
            type="number"
            title={`${ch} 通道值`}
            min={0}
            max={inputMode === "255" ? 255 : 1}
            step={inputMode === "255" ? 1 : 0.0001}
            value={inputMode === "255" ? Math.round(rgb[i] * 255) : parseFloat(rgb[i].toFixed(4))}
            onChange={(e) => handleChannelChange(i, parseFloat(e.target.value) || 0)}
            className="w-full mt-1 bg-slate-700 text-slate-200 rounded px-2 py-1 text-sm font-mono border border-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>
      ))}

      {/* Hex Input */}
      <div>
        <label htmlFor="hex-input" className="text-sm text-slate-400 mb-1 block">Hex (sRGB)</label>
        <input
          id="hex-input"
          type="text"
          title="sRGB Hex 颜色值"
          placeholder="#000000"
          value={hexValue.toUpperCase()}
          onChange={(e) => handleHexChange(e.target.value)}
          className="w-full bg-slate-700 text-slate-200 rounded px-3 py-2 text-sm font-mono border border-slate-600 focus:outline-none focus:border-blue-500"
          maxLength={7}
        />
      </div>

      {/* Color Preview */}
      <div className="flex justify-center pt-2">
        <ColorSwatch r={dr} g={dg} b={db} label="预览 (sRGB显示)" />
      </div>
    </div>
  );
}
