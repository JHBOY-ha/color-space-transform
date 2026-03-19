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
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <header className="bg-slate-800/80 backdrop-blur border-b border-slate-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-center">色彩空间转换程序</h1>
        <p className="text-sm text-slate-400 text-center mt-1">
          RGB ↔ CIE 1931 XYZ 双向转换 · 支持多种色彩空间与白点
        </p>
      </header>

      <div className="max-w-[1440px] mx-auto p-4 grid grid-cols-1 lg:grid-cols-[320px_1fr_340px] gap-4">
        <div className="overflow-y-auto max-h-[calc(100vh-120px)]">
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

        <div className="flex flex-col gap-4">
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

        <div className="overflow-y-auto max-h-[calc(100vh-120px)] flex flex-col gap-4">
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
      </div>
    </main>
  );
}
