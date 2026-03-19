"use client";

import { computeRGBtoXYZMatrix, chromaticAdaptationMatrix } from "@/lib/colorConvert";
import { COLOR_SPACES } from "@/lib/colorData";
import { mat3x3Inverse } from "@/lib/matrix";
import type { Mat3 } from "@/lib/matrix";

interface MatrixDisplayProps {
  srcSpace: string;
  whitePoint: string;
  destSpace: string;
}

function MatrixTable({ matrix, label }: { matrix: Mat3; label: string }) {
  return (
    <div className="metric-card p-3">
      <h4 className="mb-2 text-xs font-semibold text-slate-400">{label}</h4>
      <table className="w-full text-xs font-mono text-slate-300">
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              {row.map((val, j) => (
                <td key={j} className="px-1 py-1 text-right">
                  {val >= 0 ? "\u00A0" : ""}{val.toFixed(6)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MatrixDisplay({
  srcSpace,
  whitePoint,
  destSpace,
}: MatrixDisplayProps) {
  const srcDef = COLOR_SPACES[srcSpace];
  const destDef = COLOR_SPACES[destSpace];
  if (!srcDef || !destDef) return null;

  const forwardMatrix = computeRGBtoXYZMatrix(srcDef);
  const inverseMatrix = mat3x3Inverse(computeRGBtoXYZMatrix(destDef));

  const needsSrcAdapt = whitePoint !== srcDef.whitePoint;
  const needsDestAdapt = whitePoint !== destDef.whitePoint;

  return (
    <details className="app-panel rounded-[24px] p-4 sm:p-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <div>
          <p className="app-kicker text-[11px] font-semibold">Matrices</p>
          <h3 className="mt-1 text-lg font-semibold text-white">转换矩阵</h3>
        </div>
        <span className="rounded-full border border-slate-700/70 bg-slate-950/35 px-3 py-1 text-xs font-medium text-slate-300">
          展开查看
        </span>
      </summary>

      <div className="mt-4 flex flex-col gap-3">
        <MatrixTable
          matrix={forwardMatrix}
          label={`M (${srcDef.name} → XYZ [${srcDef.whitePoint}])`}
        />

        {needsSrcAdapt && (
          <MatrixTable
            matrix={chromaticAdaptationMatrix(srcDef.whitePoint, whitePoint)}
            label={`Bradford (${srcDef.whitePoint} → ${whitePoint})`}
          />
        )}

        {needsDestAdapt && (
          <MatrixTable
            matrix={chromaticAdaptationMatrix(whitePoint, destDef.whitePoint)}
            label={`Bradford (${whitePoint} → ${destDef.whitePoint})`}
          />
        )}

        <MatrixTable
          matrix={inverseMatrix}
          label={`M⁻¹ (XYZ [${destDef.whitePoint}] → ${destDef.name})`}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-slate-700/70 bg-slate-950/40 px-3 py-3 text-[11px] leading-6 text-slate-500">
        <p>正向: RGB → 线性化 → M × [R,G,B]ᵀ → 色适应 → XYZ</p>
        <p>逆向: XYZ → 色适应 → M⁻¹ × [X,Y,Z]ᵀ → 压缩 → RGB</p>
      </div>
    </details>
  );
}
