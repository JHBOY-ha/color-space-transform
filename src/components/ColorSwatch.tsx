"use client";

interface ColorSwatchProps {
  r: number;
  g: number;
  b: number;
  label?: string;
  outOfGamut?: boolean;
}

export default function ColorSwatch({ r, g, b, label, outOfGamut }: ColorSwatchProps) {
  const bgColor = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

  return (
    <div className="flex flex-col items-center gap-1">
      {label && <span className="text-xs text-slate-400">{label}</span>}
      <div
        className={`w-20 h-20 rounded-lg border-2 ${
          outOfGamut ? "border-red-500" : "border-slate-600"
        } shadow-inner`}
        style={{ backgroundColor: bgColor }}
      />
      {outOfGamut && (
        <span className="text-xs text-red-400">色域外</span>
      )}
    </div>
  );
}
