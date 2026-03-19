"use client";

import { COLOR_SPACES } from "@/lib/colorData";
import { xyzToRgb, xyzToXyy, xyzToLab, toDisplayRGB } from "@/lib/colorConvert";
import type { Vec3 } from "@/lib/matrix";
import ColorSwatch from "./ColorSwatch";

interface OutputPanelProps {
  xyz: Vec3;
  srcWhitePoint: string;
  destSpace: string;
  onDestSpaceChange: (space: string) => void;
}

function ValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-mono text-slate-200">{value}</span>
    </div>
  );
}

export default function OutputPanel({
  xyz,
  srcWhitePoint,
  destSpace,
  onDestSpaceChange,
}: OutputPanelProps) {
  const [X, Y, Z] = xyz;
  const [x, y, Ylum] = xyzToXyy(X, Y, Z);
  const [L, a, b] = xyzToLab(X, Y, Z, srcWhitePoint);

  // Reverse conversion
  const destSpaceDef = COLOR_SPACES[destSpace];
  const rgbResult = xyzToRgb(X, Y, Z, destSpace, srcWhitePoint);

  // Display RGB (convert to sRGB 0-255 for preview)
  const [dr, dg, db] = toDisplayRGB(rgbResult.r, rgbResult.g, rgbResult.b, destSpace);

  return (
    <div className="bg-slate-800 rounded-xl p-5 flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-200">输出</h2>

      {/* XYZ Values */}
      <div className="bg-slate-750 rounded-lg p-3 bg-slate-900/50">
        <h3 className="text-sm font-semibold text-blue-400 mb-2">CIE XYZ 三刺激值</h3>
        <ValueRow label="X" value={X.toFixed(6)} />
        <ValueRow label="Y" value={Y.toFixed(6)} />
        <ValueRow label="Z" value={Z.toFixed(6)} />
      </div>

      {/* xyY Values */}
      <div className="bg-slate-900/50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-green-400 mb-2">xyY 色度坐标</h3>
        <ValueRow label="x" value={x.toFixed(6)} />
        <ValueRow label="y" value={y.toFixed(6)} />
        <ValueRow label="Y" value={Ylum.toFixed(6)} />
      </div>

      {/* CIELAB Values */}
      <div className="bg-slate-900/50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-purple-400 mb-2">CIELAB</h3>
        <ValueRow label="L*" value={L.toFixed(4)} />
        <ValueRow label="a*" value={a.toFixed(4)} />
        <ValueRow label="b*" value={b.toFixed(4)} />
      </div>

      {/* Reverse Conversion */}
      <div className="bg-slate-900/50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-orange-400 mb-2">逆向转换 (XYZ → RGB)</h3>
        <label htmlFor="dest-space" className="text-sm text-slate-400 mb-1 block">目标色彩空间</label>
        <select
          id="dest-space"
          title="目标色彩空间"
          value={destSpace}
          onChange={(e) => onDestSpaceChange(e.target.value)}
          className="w-full bg-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:border-blue-500 mb-3"
        >
          {Object.entries(COLOR_SPACES).map(([key, cs]) => (
            <option key={key} value={key}>
              {cs.name}
            </option>
          ))}
        </select>
        <ValueRow
          label={`R (${destSpaceDef?.name || destSpace})`}
          value={rgbResult.r.toFixed(6)}
        />
        <ValueRow
          label={`G (${destSpaceDef?.name || destSpace})`}
          value={rgbResult.g.toFixed(6)}
        />
        <ValueRow
          label={`B (${destSpaceDef?.name || destSpace})`}
          value={rgbResult.b.toFixed(6)}
        />
        <ValueRow
          label="R (0-255)"
          value={Math.round(rgbResult.r * 255).toString()}
        />
        <ValueRow
          label="G (0-255)"
          value={Math.round(rgbResult.g * 255).toString()}
        />
        <ValueRow
          label="B (0-255)"
          value={Math.round(rgbResult.b * 255).toString()}
        />
        {!rgbResult.inGamut && (
          <div className="mt-2 px-3 py-1.5 bg-red-900/30 border border-red-700 rounded text-xs text-red-300">
            ⚠ 该颜色超出 {destSpaceDef?.name || destSpace} 色域范围，已裁剪
          </div>
        )}
      </div>

      {/* Color Preview */}
      <div className="flex justify-center pt-2">
        <ColorSwatch
          r={dr}
          g={dg}
          b={db}
          label="输出预览 (sRGB显示)"
          outOfGamut={!rgbResult.inGamut}
        />
      </div>
    </div>
  );
}
