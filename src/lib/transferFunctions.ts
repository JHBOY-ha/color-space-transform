// Transfer function registry: non-linear <-> linear conversion

// sRGB inverse companding (non-linear -> linear)
function srgbLinearize(v: number): number {
  if (v <= 0.04045) return v / 12.92;
  return Math.pow((v + 0.055) / 1.055, 2.4);
}

// sRGB forward companding (linear -> non-linear)
function srgbCompand(v: number): number {
  if (v <= 0.0031308) return 12.92 * v;
  return 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}

// Rec.2020 (12-bit) inverse companding
function rec2020Linearize(v: number): number {
  const alpha = 1.09929682680944;
  const beta = 0.018053968510807;
  if (v < 4.5 * beta) return v / 4.5;
  return Math.pow((v + (alpha - 1)) / alpha, 1 / 0.45);
}

// Rec.2020 forward companding
function rec2020Compand(v: number): number {
  const alpha = 1.09929682680944;
  const beta = 0.018053968510807;
  if (v < beta) return 4.5 * v;
  return alpha * Math.pow(v, 0.45) - (alpha - 1);
}

// ProPhoto RGB inverse companding
function proPhotoLinearize(v: number): number {
  const Et = 1 / 512;
  if (v <= 16 * Et) return v / 16;
  return Math.pow(v, 1.8);
}

// ProPhoto RGB forward companding
function proPhotoCompand(v: number): number {
  const Et = 1 / 512;
  if (v < Et) return 16 * v;
  return Math.pow(v, 1 / 1.8);
}

// Simple gamma
function gammaLinearize(v: number, gamma: number): number {
  return Math.pow(Math.abs(v), gamma) * Math.sign(v);
}

function gammaCompand(v: number, gamma: number): number {
  return Math.pow(Math.abs(v), 1 / gamma) * Math.sign(v);
}

interface TransferFunctionPair {
  linearize: (v: number) => number;
  compand: (v: number) => number;
}

const TRANSFER_FUNCTIONS: Record<string, TransferFunctionPair> = {
  sRGB: { linearize: srgbLinearize, compand: srgbCompand },
  rec2020: { linearize: rec2020Linearize, compand: rec2020Compand },
  proPhoto: { linearize: proPhotoLinearize, compand: proPhotoCompand },
  "gamma1.8": {
    linearize: (v) => gammaLinearize(v, 1.8),
    compand: (v) => gammaCompand(v, 1.8),
  },
  "gamma2.19921875": {
    linearize: (v) => gammaLinearize(v, 2.19921875),
    compand: (v) => gammaCompand(v, 2.19921875),
  },
  "gamma2.2": {
    linearize: (v) => gammaLinearize(v, 2.2),
    compand: (v) => gammaCompand(v, 2.2),
  },
  "gamma2.4": {
    linearize: (v) => gammaLinearize(v, 2.4),
    compand: (v) => gammaCompand(v, 2.4),
  },
  "gamma2.6": {
    linearize: (v) => gammaLinearize(v, 2.6),
    compand: (v) => gammaCompand(v, 2.6),
  },
  "gamma2.8": {
    linearize: (v) => gammaLinearize(v, 2.8),
    compand: (v) => gammaCompand(v, 2.8),
  },
};

export function linearize(value: number, tfName: string): number {
  const tf = TRANSFER_FUNCTIONS[tfName];
  if (!tf) throw new Error(`Unknown transfer function: ${tfName}`);
  return tf.linearize(value);
}

export function compand(value: number, tfName: string): number {
  const tf = TRANSFER_FUNCTIONS[tfName];
  if (!tf) throw new Error(`Unknown transfer function: ${tfName}`);
  return tf.compand(value);
}
