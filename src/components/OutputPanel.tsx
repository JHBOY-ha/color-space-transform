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
    <div className="flex items-center justify-between gap-4 py-1.5">
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
    <div className="app-panel flex flex-col gap-4 rounded-[24px] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="app-kicker text-[11px] font-semibold">Output</p>
          <h2 className="mt-1 text-lg font-semibold text-white">计算结果</h2>
        </div>
        <div className="rounded-full border border-slate-700/70 bg-slate-950/35 px-3 py-1 text-xs font-medium text-slate-300">
          {destSpaceDef?.name || destSpace}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="metric-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-sky-300">CIE XYZ 三刺激值</h3>
          <ValueRow label="X" value={X.toFixed(6)} />
          <ValueRow label="Y" value={Y.toFixed(6)} />
          <ValueRow label="Z" value={Z.toFixed(6)} />
        </div>

        <div className="metric-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-emerald-300">xyY 色度坐标</h3>
          <ValueRow label="x" value={x.toFixed(6)} />
          <ValueRow label="y" value={y.toFixed(6)} />
          <ValueRow label="Y" value={Ylum.toFixed(6)} />
        </div>

        <div className="metric-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-fuchsia-300">CIELAB</h3>
          <ValueRow label="L*" value={L.toFixed(4)} />
          <ValueRow label="a*" value={a.toFixed(4)} />
          <ValueRow label="b*" value={b.toFixed(4)} />
        </div>
      </div>

      <div className="metric-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-amber-300">逆向转换 (XYZ → RGB)</h3>
        <label htmlFor="dest-space" className="mb-2 block text-sm text-slate-400">目标色彩空间</label>
        <select
          id="dest-space"
          title="目标色彩空间"
          value={destSpace}
          onChange={(e) => onDestSpaceChange(e.target.value)}
          className="app-select mb-4 px-3 py-2 text-sm"
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
          <div className="mt-3 rounded-2xl border border-red-500/35 bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-200">
            该颜色超出 {destSpaceDef?.name || destSpace} 色域范围，结果已裁剪到可显示范围内。
          </div>
        )}
        <div className="mt-4 flex justify-center">
          <ColorSwatch
            r={dr}
            g={dg}
            b={db}
            label="输出预览"
            outOfGamut={!rgbResult.inGamut}
          />
        </div>
      </div>
    </div>
  );
}
