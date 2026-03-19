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
    <div className="flex flex-col items-center gap-2">
      {label && <span className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</span>}
      <div
        className={`h-[5.5rem] w-[5.5rem] rounded-[1.2rem] border sm:h-24 sm:w-24 ${
          outOfGamut ? "border-red-400/70" : "border-slate-500/45"
        } shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_40px_rgba(2,8,23,0.38)]`}
        style={{ backgroundColor: bgColor }}
      />
      {outOfGamut && (
        <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-300">
          超出目标色域
        </span>
      )}
    </div>
  );
}
