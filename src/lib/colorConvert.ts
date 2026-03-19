import type { Mat3, Vec3 } from "./matrix";
import { mat3x3Inverse, mat3x3Multiply, mat3x3MultiplyVec } from "./matrix";
import {
  COLOR_SPACES,
  WHITE_POINTS,
  BRADFORD_MATRIX,
  BRADFORD_MATRIX_INV,
} from "./colorData";
import type { ColorSpaceDefinition } from "./colorData";
import { linearize, compand } from "./transferFunctions";

// Cache for computed matrices
const matrixCache: Record<string, Mat3> = {};

/**
 * Compute the RGB-to-XYZ matrix from primaries and white point.
 * Algorithm per Bruce Lindbloom.
 */
export function computeRGBtoXYZMatrix(space: ColorSpaceDefinition): Mat3 {
  const wp = WHITE_POINTS[space.whitePoint];
  const { r, g, b } = space.primaries;

  // Chromaticity to tristimulus for each primary (Y=1)
  const Xr = r.x / r.y,
    Yr = 1,
    Zr = (1 - r.x - r.y) / r.y;
  const Xg = g.x / g.y,
    Yg = 1,
    Zg = (1 - g.x - g.y) / g.y;
  const Xb = b.x / b.y,
    Yb = 1,
    Zb = (1 - b.x - b.y) / b.y;

  const M: Mat3 = [
    [Xr, Xg, Xb],
    [Yr, Yg, Yb],
    [Zr, Zg, Zb],
  ];

  const Minv = mat3x3Inverse(M);
  const S = mat3x3MultiplyVec(Minv, [wp.X, wp.Y, wp.Z]);

  return [
    [S[0] * Xr, S[1] * Xg, S[2] * Xb],
    [S[0] * Yr, S[1] * Yg, S[2] * Yb],
    [S[0] * Zr, S[1] * Zg, S[2] * Zb],
  ];
}

function getRGBtoXYZMatrix(spaceKey: string): Mat3 {
  const cacheKey = `${spaceKey}_toXYZ`;
  if (!matrixCache[cacheKey]) {
    const space = COLOR_SPACES[spaceKey];
    if (!space) throw new Error(`Unknown color space: ${spaceKey}`);
    matrixCache[cacheKey] = computeRGBtoXYZMatrix(space);
  }
  return matrixCache[cacheKey];
}

function getXYZtoRGBMatrix(spaceKey: string): Mat3 {
  const cacheKey = `${spaceKey}_toRGB`;
  if (!matrixCache[cacheKey]) {
    matrixCache[cacheKey] = mat3x3Inverse(getRGBtoXYZMatrix(spaceKey));
  }
  return matrixCache[cacheKey];
}

/**
 * Bradford chromatic adaptation transform.
 * Adapts XYZ from source white point to destination white point.
 */
export function chromaticAdaptationMatrix(
  srcWPKey: string,
  dstWPKey: string
): Mat3 {
  if (srcWPKey === dstWPKey) {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
  }

  const cacheKey = `adapt_${srcWPKey}_${dstWPKey}`;
  if (matrixCache[cacheKey]) return matrixCache[cacheKey];

  const srcWP = WHITE_POINTS[srcWPKey];
  const dstWP = WHITE_POINTS[dstWPKey];

  const srcCone = mat3x3MultiplyVec(BRADFORD_MATRIX, [srcWP.X, srcWP.Y, srcWP.Z]);
  const dstCone = mat3x3MultiplyVec(BRADFORD_MATRIX, [dstWP.X, dstWP.Y, dstWP.Z]);

  const scale: Mat3 = [
    [dstCone[0] / srcCone[0], 0, 0],
    [0, dstCone[1] / srcCone[1], 0],
    [0, 0, dstCone[2] / srcCone[2]],
  ];

  const result = mat3x3Multiply(
    BRADFORD_MATRIX_INV,
    mat3x3Multiply(scale, BRADFORD_MATRIX)
  );
  matrixCache[cacheKey] = result;
  return result;
}

/**
 * Convert non-linear RGB [0,1] to CIE XYZ.
 * Optionally adapt to a different white point.
 */
export function rgbToXyz(
  r: number,
  g: number,
  b: number,
  srcSpaceKey: string,
  destWPKey?: string
): Vec3 {
  const space = COLOR_SPACES[srcSpaceKey];
  if (!space) throw new Error(`Unknown color space: ${srcSpaceKey}`);

  // Step 1: Linearize (inverse companding)
  const rLin = linearize(r, space.transferFunction);
  const gLin = linearize(g, space.transferFunction);
  const bLin = linearize(b, space.transferFunction);

  // Step 2: Matrix multiplication
  const M = getRGBtoXYZMatrix(srcSpaceKey);
  let xyz = mat3x3MultiplyVec(M, [rLin, gLin, bLin]);

  // Step 3: Chromatic adaptation if needed
  if (destWPKey && destWPKey !== space.whitePoint) {
    const adaptM = chromaticAdaptationMatrix(space.whitePoint, destWPKey);
    xyz = mat3x3MultiplyVec(adaptM, xyz);
  }

  return xyz;
}

export interface RGBResult {
  r: number;
  g: number;
  b: number;
  inGamut: boolean;
}

/**
 * Convert CIE XYZ to non-linear RGB [0,1] in the specified color space.
 */
export function xyzToRgb(
  X: number,
  Y: number,
  Z: number,
  destSpaceKey: string,
  srcWPKey?: string
): RGBResult {
  const space = COLOR_SPACES[destSpaceKey];
  if (!space) throw new Error(`Unknown color space: ${destSpaceKey}`);

  let xyz: Vec3 = [X, Y, Z];

  // Step 1: Chromatic adaptation if needed
  if (srcWPKey && srcWPKey !== space.whitePoint) {
    const adaptM = chromaticAdaptationMatrix(srcWPKey, space.whitePoint);
    xyz = mat3x3MultiplyVec(adaptM, xyz);
  }

  // Step 2: Inverse matrix multiplication
  const Minv = getXYZtoRGBMatrix(destSpaceKey);
  const [rLin, gLin, bLin] = mat3x3MultiplyVec(Minv, xyz);

  // Step 3: Check gamut
  const inGamut =
    rLin >= -0.0001 && rLin <= 1.0001 &&
    gLin >= -0.0001 && gLin <= 1.0001 &&
    bLin >= -0.0001 && bLin <= 1.0001;

  // Step 4: Clamp and compand (forward companding)
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const r = compand(clamp(rLin), space.transferFunction);
  const g = compand(clamp(gLin), space.transferFunction);
  const b = compand(clamp(bLin), space.transferFunction);

  return { r, g, b, inGamut };
}

/**
 * XYZ to xyY chromaticity coordinates.
 */
export function xyzToXyy(X: number, Y: number, Z: number): Vec3 {
  const sum = X + Y + Z;
  if (sum < 1e-10) {
    // Default to D65 white point for black
    return [0.31271, 0.32902, 0];
  }
  return [X / sum, Y / sum, Y];
}

/**
 * xyY to XYZ.
 */
export function xyyToXyz(x: number, y: number, Ylum: number): Vec3 {
  if (y < 1e-10) return [0, 0, 0];
  return [(x * Ylum) / y, Ylum, ((1 - x - y) * Ylum) / y];
}

/**
 * XYZ to CIELAB.
 */
export function xyzToLab(
  X: number,
  Y: number,
  Z: number,
  wpKey: string = "D65"
): Vec3 {
  const wp = WHITE_POINTS[wpKey];
  const epsilon = 216 / 24389;
  const kappa = 24389 / 27;

  const f = (t: number): number => {
    if (t > epsilon) return Math.cbrt(t);
    return (kappa * t + 16) / 116;
  };

  const fx = f(X / wp.X);
  const fy = f(Y / wp.Y);
  const fz = f(Z / wp.Z);

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return [L, a, b];
}

/**
 * Convert linear RGB to sRGB for display preview.
 */
export function toDisplayRGB(
  r: number,
  g: number,
  b: number,
  srcSpaceKey: string
): [number, number, number] {
  if (srcSpaceKey === "sRGB") {
    const to255 = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 255);
    return [to255(r), to255(g), to255(b)];
  }

  // Convert to XYZ then to sRGB for display
  const xyz = rgbToXyz(r, g, b, srcSpaceKey, "D65");
  const srgb = xyzToRgb(xyz[0], xyz[1], xyz[2], "sRGB");
  const to255 = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 255);
  return [to255(srgb.r), to255(srgb.g), to255(srgb.b)];
}
