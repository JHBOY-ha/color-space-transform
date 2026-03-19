import type { Mat3 } from "./matrix";

export interface WhitePoint {
  name: string;
  x: number;
  y: number;
  X: number;
  Y: number;
  Z: number;
}

export interface ColorSpacePrimaries {
  r: { x: number; y: number };
  g: { x: number; y: number };
  b: { x: number; y: number };
}

export interface ColorSpaceDefinition {
  name: string;
  primaries: ColorSpacePrimaries;
  whitePoint: string; // key into WHITE_POINTS
  transferFunction: string; // key into transfer function registry
}

// CIE 1931 2° standard observer white points
export const WHITE_POINTS: Record<string, WhitePoint> = {
  A: { name: "A (钨丝灯)", x: 0.44757, y: 0.40745, X: 1.0985, Y: 1.0, Z: 0.35585 },
  C: { name: "C (日光)", x: 0.31006, y: 0.31616, X: 0.98074, Y: 1.0, Z: 1.18232 },
  D50: { name: "D50", x: 0.34567, y: 0.3585, X: 0.96422, Y: 1.0, Z: 0.82521 },
  D55: { name: "D55", x: 0.33242, y: 0.34743, X: 0.95682, Y: 1.0, Z: 0.92149 },
  D65: { name: "D65", x: 0.31271, y: 0.32902, X: 0.95047, Y: 1.0, Z: 1.08883 },
  D75: { name: "D75", x: 0.29902, y: 0.31485, X: 0.94972, Y: 1.0, Z: 1.22638 },
  E: { name: "E (等能)", x: 1 / 3, y: 1 / 3, X: 1.0, Y: 1.0, Z: 1.0 },
  F2: { name: "F2 (荧光灯)", x: 0.37208, y: 0.37529, X: 0.99186, Y: 1.0, Z: 0.67393 },
  F7: { name: "F7", x: 0.31292, y: 0.32933, X: 0.95041, Y: 1.0, Z: 1.08747 },
  F11: { name: "F11", x: 0.38052, y: 0.37713, X: 1.00962, Y: 1.0, Z: 0.6435 },
};

export const COLOR_SPACES: Record<string, ColorSpaceDefinition> = {
  sRGB: {
    name: "sRGB / Rec.709",
    primaries: {
      r: { x: 0.64, y: 0.33 },
      g: { x: 0.3, y: 0.6 },
      b: { x: 0.15, y: 0.06 },
    },
    whitePoint: "D65",
    transferFunction: "sRGB",
  },
  AdobeRGB: {
    name: "Adobe RGB (1998)",
    primaries: {
      r: { x: 0.64, y: 0.33 },
      g: { x: 0.21, y: 0.71 },
      b: { x: 0.15, y: 0.06 },
    },
    whitePoint: "D65",
    transferFunction: "gamma2.19921875",
  },
  AppleRGB: {
    name: "Apple RGB",
    primaries: {
      r: { x: 0.625, y: 0.34 },
      g: { x: 0.28, y: 0.595 },
      b: { x: 0.155, y: 0.07 },
    },
    whitePoint: "D65",
    transferFunction: "gamma1.8",
  },
  ProPhotoRGB: {
    name: "ProPhoto RGB",
    primaries: {
      r: { x: 0.7347, y: 0.2653 },
      g: { x: 0.1596, y: 0.8404 },
      b: { x: 0.0366, y: 0.0001 },
    },
    whitePoint: "D50",
    transferFunction: "proPhoto",
  },
  DisplayP3: {
    name: "Display P3",
    primaries: {
      r: { x: 0.68, y: 0.32 },
      g: { x: 0.265, y: 0.69 },
      b: { x: 0.15, y: 0.06 },
    },
    whitePoint: "D65",
    transferFunction: "sRGB",
  },
  "Rec.2020": {
    name: "Rec. 2020",
    primaries: {
      r: { x: 0.708, y: 0.292 },
      g: { x: 0.17, y: 0.797 },
      b: { x: 0.131, y: 0.046 },
    },
    whitePoint: "D65",
    transferFunction: "rec2020",
  },
  WideGamutRGB: {
    name: "Wide Gamut RGB",
    primaries: {
      r: { x: 0.735, y: 0.265 },
      g: { x: 0.115, y: 0.826 },
      b: { x: 0.157, y: 0.018 },
    },
    whitePoint: "D50",
    transferFunction: "gamma2.2",
  },
  ColorMatchRGB: {
    name: "ColorMatch RGB",
    primaries: {
      r: { x: 0.63, y: 0.34 },
      g: { x: 0.295, y: 0.605 },
      b: { x: 0.15, y: 0.075 },
    },
    whitePoint: "D50",
    transferFunction: "gamma1.8",
  },
  NTSC: {
    name: "NTSC RGB",
    primaries: {
      r: { x: 0.67, y: 0.33 },
      g: { x: 0.21, y: 0.71 },
      b: { x: 0.14, y: 0.08 },
    },
    whitePoint: "C",
    transferFunction: "gamma2.2",
  },
  PALSECAM: {
    name: "PAL/SECAM RGB",
    primaries: {
      r: { x: 0.64, y: 0.33 },
      g: { x: 0.29, y: 0.6 },
      b: { x: 0.15, y: 0.06 },
    },
    whitePoint: "D65",
    transferFunction: "gamma2.8",
  },
  CIERGB: {
    name: "CIE RGB",
    primaries: {
      r: { x: 0.735, y: 0.265 },
      g: { x: 0.274, y: 0.717 },
      b: { x: 0.167, y: 0.009 },
    },
    whitePoint: "E",
    transferFunction: "gamma2.2",
  },
};

// Bradford chromatic adaptation matrix
export const BRADFORD_MATRIX: Mat3 = [
  [0.8951, 0.2664, -0.1614],
  [-0.7502, 1.7135, 0.0367],
  [0.0389, -0.0685, 1.0296],
];

export const BRADFORD_MATRIX_INV: Mat3 = [
  [0.9869929, -0.1470543, 0.1599627],
  [0.4323053, 0.5183603, 0.0492912],
  [-0.0085287, 0.0400428, 0.9684867],
];

// CIE 1931 2° observer spectral locus (x, y) at 5nm intervals
export const SPECTRAL_LOCUS: [number, number, number][] = [
  [380, 0.1741, 0.005],
  [385, 0.174, 0.005],
  [390, 0.1738, 0.0049],
  [395, 0.1736, 0.0049],
  [400, 0.1733, 0.0048],
  [405, 0.173, 0.0048],
  [410, 0.1726, 0.0048],
  [415, 0.1714, 0.0051],
  [420, 0.1689, 0.0069],
  [425, 0.1644, 0.0109],
  [430, 0.1566, 0.0177],
  [435, 0.144, 0.0297],
  [440, 0.1241, 0.0578],
  [445, 0.0913, 0.1327],
  [450, 0.0687, 0.2007],
  [455, 0.0454, 0.295],
  [460, 0.0235, 0.4127],
  [465, 0.0082, 0.5384],
  [470, 0.0039, 0.6548],
  [475, 0.0139, 0.7502],
  [480, 0.0389, 0.812],
  [485, 0.0743, 0.8338],
  [490, 0.1142, 0.8262],
  [495, 0.1547, 0.8059],
  [500, 0.1929, 0.7816],
  [505, 0.2296, 0.7543],
  [510, 0.2658, 0.7243],
  [515, 0.3016, 0.6923],
  [520, 0.3373, 0.6589],
  [525, 0.3731, 0.6245],
  [530, 0.4087, 0.5896],
  [535, 0.4441, 0.5547],
  [540, 0.4788, 0.5202],
  [545, 0.5125, 0.4866],
  [550, 0.5448, 0.4544],
  [555, 0.5752, 0.4242],
  [560, 0.6029, 0.3965],
  [565, 0.627, 0.3725],
  [570, 0.6482, 0.3514],
  [575, 0.6658, 0.334],
  [580, 0.6801, 0.3197],
  [585, 0.6915, 0.3083],
  [590, 0.7006, 0.2993],
  [595, 0.7079, 0.292],
  [600, 0.714, 0.2859],
  [605, 0.719, 0.2809],
  [610, 0.723, 0.277],
  [615, 0.726, 0.274],
  [620, 0.7283, 0.2717],
  [625, 0.73, 0.27],
  [630, 0.7311, 0.2689],
  [635, 0.732, 0.268],
  [640, 0.7327, 0.2673],
  [645, 0.7334, 0.2666],
  [650, 0.734, 0.266],
  [655, 0.7344, 0.2656],
  [660, 0.7346, 0.2654],
  [665, 0.7347, 0.2653],
  [670, 0.7347, 0.2653],
  [675, 0.7347, 0.2653],
  [680, 0.7347, 0.2653],
  [685, 0.7347, 0.2653],
  [690, 0.7347, 0.2653],
  [695, 0.7347, 0.2653],
  [700, 0.7347, 0.2653],
];

// Planckian (blackbody) locus - CIE 1931 chromaticity coordinates at various CCTs
// Data from CIE 15:2004
export const PLANCKIAN_LOCUS: [number, number, number][] = [
  [1000, 0.6499, 0.3474],
  [1500, 0.5857, 0.3931],
  [2000, 0.5267, 0.4133],
  [2500, 0.4770, 0.4137],
  [3000, 0.4369, 0.4041],
  [3500, 0.4053, 0.3907],
  [4000, 0.3805, 0.3768],
  [4500, 0.3608, 0.3636],
  [5000, 0.3451, 0.3516],
  [5500, 0.3325, 0.3411],
  [6000, 0.3221, 0.3318],
  [6500, 0.3135, 0.3237],
  [7000, 0.3064, 0.3166],
  [7500, 0.3004, 0.3103],
  [8000, 0.2952, 0.3048],
  [9000, 0.2869, 0.2956],
  [10000, 0.2807, 0.2884],
  [15000, 0.2642, 0.2672],
  [20000, 0.2578, 0.2580],
  [25000, 0.2546, 0.2530],
];

// Colors for gamut triangle overlays
export const GAMUT_COLORS: Record<string, string> = {
  sRGB: "#ffffff",
  AdobeRGB: "#ff9900",
  ProPhotoRGB: "#00ff88",
  DisplayP3: "#ff44ff",
  "Rec.2020": "#44ffff",
  WideGamutRGB: "#ffff44",
  AppleRGB: "#ff6666",
  ColorMatchRGB: "#6666ff",
  NTSC: "#88ff44",
  PALSECAM: "#ff8844",
  CIERGB: "#44ff44",
};
