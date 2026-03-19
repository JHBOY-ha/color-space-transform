"use client";

import { useRef, useEffect, useCallback } from "react";
import { SPECTRAL_LOCUS, PLANCKIAN_LOCUS, COLOR_SPACES, WHITE_POINTS, GAMUT_COLORS } from "@/lib/colorData";
import { xyzToRgb, xyzToXyy } from "@/lib/colorConvert";
import type { Vec3 } from "@/lib/matrix";

interface CIEDiagramProps {
  currentXyz: Vec3;
  srcSpace: string;
  selectedGamuts: string[];
  whitePoint: string;
  onChromaticityClick?: (x: number, y: number) => void;
}

const CANVAS_SIZE = 500;
const MARGIN = 40;
const PLOT_SIZE = CANVAS_SIZE - 2 * MARGIN;

// Chromaticity range
const X_MIN = 0;
const X_MAX = 0.8;
const Y_MIN = 0;
const Y_MAX = 0.9;

function chromToCanvas(cx: number, cy: number): [number, number] {
  const px = MARGIN + ((cx - X_MIN) / (X_MAX - X_MIN)) * PLOT_SIZE;
  const py = MARGIN + ((Y_MAX - cy) / (Y_MAX - Y_MIN)) * PLOT_SIZE; // inverted Y
  return [px, py];
}

function canvasToChrom(px: number, py: number): [number, number] {
  const cx = X_MIN + ((px - MARGIN) / PLOT_SIZE) * (X_MAX - X_MIN);
  const cy = Y_MAX - ((py - MARGIN) / PLOT_SIZE) * (Y_MAX - Y_MIN);
  return [cx, cy];
}

// Point-in-polygon test (ray casting)
function pointInPolygon(px: number, py: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1];
    const xj = polygon[j][0],
      yj = polygon[j][1];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// Build the horseshoe polygon from spectral locus
const horseshoePolygon: [number, number][] = SPECTRAL_LOCUS.map(([, x, y]) => [x, y]);
// Close with purple line
horseshoePolygon.push(horseshoePolygon[0]);

// Generate the background as an offscreen canvas (expensive, done once)
function generateBackground(): HTMLCanvasElement {
  const offscreen = document.createElement("canvas");
  offscreen.width = CANVAS_SIZE;
  offscreen.height = CANVAS_SIZE;
  const ctx = offscreen.getContext("2d")!;
  const imageData = ctx.createImageData(CANVAS_SIZE, CANVAS_SIZE);
  const data = imageData.data;

  for (let py = 0; py < CANVAS_SIZE; py++) {
    for (let px = 0; px < CANVAS_SIZE; px++) {
      const idx = (py * CANVAS_SIZE + px) * 4;
      const [cx, cy] = canvasToChrom(px, py);

      if (cx >= 0 && cx <= 0.75 && cy > 0.001 && cy <= 0.85 && pointInPolygon(cx, cy, horseshoePolygon)) {
        const Ylum = 0.4;
        const X = (cx * Ylum) / cy;
        const Z = ((1 - cx - cy) * Ylum) / cy;

        const result = xyzToRgb(X, Ylum, Z, "sRGB");
        data[idx] = Math.max(0, Math.min(255, Math.round(result.r * 255)));
        data[idx + 1] = Math.max(0, Math.min(255, Math.round(result.g * 255)));
        data[idx + 2] = Math.max(0, Math.min(255, Math.round(result.b * 255)));
        data[idx + 3] = 255;
      } else {
        data[idx] = 15;
        data[idx + 1] = 23;
        data[idx + 2] = 42;
        data[idx + 3] = 255;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return offscreen;
}

// Wavelength labels to show
const WAVELENGTH_LABELS = [400, 450, 470, 480, 490, 500, 510, 520, 530, 540, 560, 580, 600, 620, 650, 700];

export default function CIEDiagram({
  currentXyz,
  srcSpace,
  selectedGamuts,
  whitePoint,
  onChromaticityClick,
}: CIEDiagramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCacheRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const [currentX, currentY] = xyzToXyy(currentXyz[0], currentXyz[1], currentXyz[2]);

  const drawOverlays = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // Restore cached background (drawImage respects transforms for HiDPI)
      if (bgCacheRef.current) {
        ctx.drawImage(bgCacheRef.current, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      }

      // Draw grid lines
      ctx.strokeStyle = "rgba(100, 116, 139, 0.2)";
      ctx.lineWidth = 0.5;
      for (let v = 0; v <= 0.8; v += 0.1) {
        const [px1, py1] = chromToCanvas(v, Y_MIN);
        const [px2, py2] = chromToCanvas(v, Y_MAX);
        ctx.beginPath();
        ctx.moveTo(px1, py1);
        ctx.lineTo(px2, py2);
        ctx.stroke();

        // X axis label
        ctx.fillStyle = "#64748b";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(v.toFixed(1), px1, CANVAS_SIZE - 8);
      }
      for (let v = 0; v <= 0.9; v += 0.1) {
        const [px1, py1] = chromToCanvas(X_MIN, v);
        const [px2, py2] = chromToCanvas(X_MAX, v);
        ctx.beginPath();
        ctx.moveTo(px1, py1);
        ctx.lineTo(px2, py2);
        ctx.stroke();

        // Y axis label
        ctx.fillStyle = "#64748b";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(v.toFixed(1), MARGIN - 5, py1 + 3);
      }

      // Draw spectral locus outline
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const [sx0, sy0] = chromToCanvas(SPECTRAL_LOCUS[0][1], SPECTRAL_LOCUS[0][2]);
      ctx.moveTo(sx0, sy0);
      for (let i = 1; i < SPECTRAL_LOCUS.length; i++) {
        const [, cx, cy] = SPECTRAL_LOCUS[i];
        const [px, py] = chromToCanvas(cx, cy);
        ctx.lineTo(px, py);
      }
      // Purple line (close the horseshoe)
      ctx.lineTo(sx0, sy0);
      ctx.stroke();

      // Draw wavelength labels
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "9px sans-serif";
      for (const wl of WAVELENGTH_LABELS) {
        const entry = SPECTRAL_LOCUS.find(([w]) => w === wl);
        if (entry) {
          const [, cx, cy] = entry;
          const [px, py] = chromToCanvas(cx, cy);

          // Offset label outside the curve
          const centerX = 0.33;
          const centerY = 0.33;
          const dx = cx - centerX;
          const dy = cy - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const offsetX = (dx / dist) * 18;
          const offsetY = (dy / dist) * 18;

          ctx.fillStyle = "#e2e8f0";
          ctx.textAlign = "center";
          ctx.fillText(`${wl}`, px + offsetX, py - offsetY);

          // Small dot on the curve
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Planckian locus (blackbody curve)
      ctx.strokeStyle = "rgba(255, 200, 100, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      const [plx0, ply0] = chromToCanvas(PLANCKIAN_LOCUS[0][1], PLANCKIAN_LOCUS[0][2]);
      ctx.moveTo(plx0, ply0);
      for (let i = 1; i < PLANCKIAN_LOCUS.length; i++) {
        const [, pcx, pcy] = PLANCKIAN_LOCUS[i];
        const [ppx, ppy] = chromToCanvas(pcx, pcy);
        ctx.lineTo(ppx, ppy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      // CCT labels on Planckian locus
      const cctLabels = [2000, 3000, 4000, 5000, 6500, 10000];
      ctx.fillStyle = "rgba(255, 200, 100, 0.7)";
      ctx.font = "8px sans-serif";
      for (const cct of cctLabels) {
        const entry = PLANCKIAN_LOCUS.find(([t]) => t === cct);
        if (entry) {
          const [, pcx, pcy] = entry;
          const [ppx, ppy] = chromToCanvas(pcx, pcy);
          ctx.textAlign = "left";
          ctx.fillText(`${cct}K`, ppx + 4, ppy - 4);
        }
      }

      // Axis labels
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("x", CANVAS_SIZE / 2, CANVAS_SIZE - 2);
      ctx.save();
      ctx.translate(10, CANVAS_SIZE / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("y", 0, 0);
      ctx.restore();

      // Draw gamut triangles
      const gamutsToDraw = [...selectedGamuts];
      if (!gamutsToDraw.includes(srcSpace)) {
        gamutsToDraw.unshift(srcSpace);
      }

      for (const spaceKey of gamutsToDraw) {
        const space = COLOR_SPACES[spaceKey];
        if (!space) continue;
        const color = spaceKey === srcSpace ? "#ffffff" : (GAMUT_COLORS[spaceKey] || "#888888");
        const { r, g, b } = space.primaries;

        const [rx, ry] = chromToCanvas(r.x, r.y);
        const [gx, gy] = chromToCanvas(g.x, g.y);
        const [bx, by] = chromToCanvas(b.x, b.y);

        ctx.strokeStyle = color;
        ctx.lineWidth = spaceKey === srcSpace ? 2 : 1.5;
        ctx.setLineDash(spaceKey === srcSpace ? [] : [4, 4]);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(gx, gy);
        ctx.lineTo(bx, by);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);

        // Semi-transparent fill for current space
        if (spaceKey === srcSpace) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
          ctx.fill();
        }

        // Label
        ctx.fillStyle = color;
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        const labelX = (rx + gx + bx) / 3;
        const labelY = (ry + gy + by) / 3;
        ctx.fillText(space.name, labelX, labelY);
      }

      // Draw white point
      const wp = WHITE_POINTS[whitePoint];
      if (wp) {
        const [wpx, wpy] = chromToCanvas(wp.x, wp.y);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        // Crosshair
        ctx.beginPath();
        ctx.moveTo(wpx - 6, wpy);
        ctx.lineTo(wpx + 6, wpy);
        ctx.moveTo(wpx, wpy - 6);
        ctx.lineTo(wpx, wpy + 6);
        ctx.stroke();
        // Circle
        ctx.beginPath();
        ctx.arc(wpx, wpy, 4, 0, Math.PI * 2);
        ctx.stroke();
        // Label
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(whitePoint, wpx + 8, wpy - 4);
      }

      // Draw current color point
      const [cx, cy] = xyzToXyy(currentXyz[0], currentXyz[1], currentXyz[2]);
      if (cy > 0.001) {
        const [cpx, cpy] = chromToCanvas(cx, cy);
        // Outer ring
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cpx, cpy, 7, 0, Math.PI * 2);
        ctx.stroke();
        // Inner filled circle
        const dispResult = xyzToRgb(currentXyz[0], currentXyz[1], currentXyz[2], "sRGB");
        const fillColor = `rgb(${Math.round(dispResult.r * 255)}, ${Math.round(dispResult.g * 255)}, ${Math.round(dispResult.b * 255)})`;
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(cpx, cpy, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [currentXyz, srcSpace, selectedGamuts, whitePoint]
  );

  // Generate background once and handle HiDPI
  useEffect(() => {
    if (!bgCacheRef.current) {
      bgCacheRef.current = generateBackground();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // HiDPI support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    drawOverlays(ctx);
  }, [drawOverlays]);

  const handlePointerEvent = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onChromaticityClick) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_SIZE / rect.width;
      const scaleY = CANVAS_SIZE / rect.height;
      const px = (e.clientX - rect.left) * scaleX;
      const py = (e.clientY - rect.top) * scaleY;
      const [cx, cy] = canvasToChrom(px, py);

      // Only trigger if inside the horseshoe
      if (cx >= 0 && cx <= 0.75 && cy > 0.001 && cy <= 0.85 && pointInPolygon(cx, cy, horseshoePolygon)) {
        onChromaticityClick(cx, cy);
      }
    },
    [onChromaticityClick]
  );

  return (
    <div className="app-panel flex flex-col gap-4 rounded-[24px] p-4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="app-kicker text-[11px] font-semibold">Visualization</p>
          <h2 className="mt-1 text-lg font-semibold text-white">CIE 1931 色度图</h2>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="app-panel-soft rounded-2xl px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Current x</p>
            <p className="mt-1 font-mono text-sm text-slate-100">{currentX.toFixed(4)}</p>
          </div>
          <div className="app-panel-soft rounded-2xl px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Current y</p>
            <p className="mt-1 font-mono text-sm text-slate-100">{currentY.toFixed(4)}</p>
          </div>
          <div className="app-panel-soft rounded-2xl px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">White Point</p>
            <p className="mt-1 text-sm font-semibold text-slate-100">{whitePoint}</p>
          </div>
        </div>
      </div>

      <div className="metric-card flex justify-center overflow-hidden rounded-[20px] p-2 sm:p-3">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
          className="max-w-full cursor-crosshair rounded-[20px]"
          onMouseDown={(e) => {
            isDraggingRef.current = true;
            handlePointerEvent(e);
          }}
          onMouseMove={(e) => {
            if (isDraggingRef.current) {
              handlePointerEvent(e);
            }
          }}
          onMouseUp={() => {
            isDraggingRef.current = false;
          }}
          onMouseLeave={() => {
            isDraggingRef.current = false;
          }}
        />
      </div>
    </div>
  );
}
