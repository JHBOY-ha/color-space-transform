"use client";

import { useState, useCallback } from "react";
import InputPanel from "@/components/InputPanel";
import OutputPanel from "@/components/OutputPanel";
import CIEDiagram from "@/components/CIEDiagram";
import GamutComparison from "@/components/GamutComparison";
import MatrixDisplay from "@/components/MatrixDisplay";
import { rgbToXyz, xyzToRgb, xyyToXyz } from "@/lib/colorConvert";
import { COLOR_SPACES } from "@/lib/colorData";
import type { Vec3 } from "@/lib/matrix";

export default function Home() {
  const [rgb, setRgb] = useState<[number, number, number]>([0.5, 0.0, 0.5]);
  const [srcSpace, setSrcSpace] = useState("sRGB");
  const [destSpace, setDestSpace] = useState("AdobeRGB");
  const [whitePoint, setWhitePoint] = useState("D65");
  const [inputMode, setInputMode] = useState<"255" | "float">("255");
  const [selectedGamuts, setSelectedGamuts] = useState<string[]>([]);

  const xyz: Vec3 = rgbToXyz(rgb[0], rgb[1], rgb[2], srcSpace, whitePoint);

  const handleSrcSpaceChange = useCallback((space: string) => {
    setSrcSpace(space);
    const spaceDef = COLOR_SPACES[space];
    if (spaceDef) {
      setWhitePoint(spaceDef.whitePoint);
    }
  }, []);

  const handleChromaticityClick = useCallback(
    (cx: number, cy: number) => {
      const currentY = Math.max(0.01, xyz[1]);
      const clickedXyz = xyyToXyz(cx, cy, currentY);
      const result = xyzToRgb(clickedXyz[0], clickedXyz[1], clickedXyz[2], srcSpace, whitePoint);
      setRgb([result.r, result.g, result.b]);
    },
    [srcSpace, whitePoint, xyz]
  );

  const handleToggleGamut = useCallback((spaceKey: string) => {
    setSelectedGamuts((prev) =>
      prev.includes(spaceKey) ? prev.filter((k) => k !== spaceKey) : [...prev, spaceKey]
    );
  }, []);

  return (
    <main className="app-shell min-h-screen px-4 pb-6 pt-4 text-slate-100 sm:px-5 lg:px-6">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4">
        <header className="app-panel rounded-[24px] px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="app-kicker text-[11px] font-semibold">Color Workflow</p>
              <div className="mt-2 flex flex-col gap-2 xl:flex-row xl:items-end xl:gap-4">
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  色彩空间转换程序
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-slate-400">
                  RGB ↔ XYZ 双向换算、色度图联动、色域对比与矩阵说明。
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[520px]">
              <div className="app-panel-soft rounded-2xl px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-sky-300/80">输入空间</p>
                <p className="mt-1 text-sm font-semibold text-white">{COLOR_SPACES[srcSpace]?.name}</p>
              </div>
              <div className="app-panel-soft rounded-2xl px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-300/80">参考白点</p>
                <p className="mt-1 text-sm font-semibold text-white">{whitePoint}</p>
              </div>
              <div className="app-panel-soft rounded-2xl px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-amber-300/80">输出空间</p>
                <p className="mt-1 text-sm font-semibold text-white">{COLOR_SPACES[destSpace]?.name}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[300px_360px_minmax(0,1fr)]">
          <div className="xl:sticky xl:top-4 xl:self-start">
            <InputPanel
              rgb={rgb}
              srcSpace={srcSpace}
              whitePoint={whitePoint}
              inputMode={inputMode}
              onRGBChange={setRgb}
              onSrcSpaceChange={handleSrcSpaceChange}
              onWhitePointChange={setWhitePoint}
              onInputModeChange={setInputMode}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <OutputPanel
              xyz={xyz}
              srcWhitePoint={whitePoint}
              destSpace={destSpace}
              onDestSpaceChange={setDestSpace}
            />
            <MatrixDisplay
              srcSpace={srcSpace}
              whitePoint={whitePoint}
              destSpace={destSpace}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-4 xl:self-start">
            <CIEDiagram
              currentXyz={xyz}
              srcSpace={srcSpace}
              selectedGamuts={selectedGamuts}
              whitePoint={whitePoint}
              onChromaticityClick={handleChromaticityClick}
            />
            <GamutComparison
              selectedGamuts={selectedGamuts}
              onToggleGamut={handleToggleGamut}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
