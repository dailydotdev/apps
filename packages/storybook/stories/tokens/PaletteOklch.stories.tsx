import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * OKLCH palette rebuild — old vs. new comparison.
 *
 * Every chromatic family was rebuilt around three OKLCH rules:
 *  1. One locked hue per family (kills the hue-drift baked into the old HSL ramps).
 *  2. Evenly-spaced perceptual lightness between the family's existing endpoints.
 *  3. Original chroma intensity preserved, only reduced where the old value fell
 *     outside the sRGB gamut (mainly very light tints near white).
 * Neutrals (salt/pepper) keep their ultra-low chroma so the accent always pops.
 *
 * The hex values below are the literal generated palette and match the values now
 * shipped in packages/shared/tailwind/colors.ts.
 */

type Row = {
  s: string;
  o: string;
  n: string;
  oL: number;
  oC: number;
  oH: number;
  nL: number;
  nC: number;
  nH: number;
};
type Family = { hue: string; rows: Row[]; why: string };

const DATA: Record<string, Family> = {
  burger: {
    hue: '41.6',
    why: 'Old ramp drifted warm→cool across shades (H 45.5°→37.2°). Locked to 41.6° so every step reads as the same terracotta; lightness now steps evenly. Chroma preserved — the deep browns stay rich.',
    rows: [
      { s: '10', o: '#C98464', n: '#CA8368', oL: 0.677, oC: 0.097, oH: 45.5, nL: 0.677, nC: 0.096, nH: 41.6 },
      { s: '20', o: '#C07A5B', n: '#BF785D', oL: 0.646, oC: 0.098, oH: 44.5, nL: 0.642, nC: 0.098, nH: 41.5 },
      { s: '30', o: '#B67052', n: '#B46D52', oL: 0.614, oC: 0.099, oH: 43.7, nL: 0.606, nC: 0.099, nH: 41.4 },
      { s: '40', o: '#AD6648', n: '#AA6247', oL: 0.583, oC: 0.101, oH: 43.3, nL: 0.572, nC: 0.102, nH: 41.1 },
      { s: '50', o: '#A0583C', n: '#9F573C', oL: 0.539, oC: 0.104, oH: 41.6, nL: 0.536, nC: 0.103, nH: 41.0 },
      { s: '60', o: '#914B31', n: '#934D32', oL: 0.493, oC: 0.102, oH: 40.7, nL: 0.5, nC: 0.102, nH: 41.3 },
      { s: '70', o: '#864129', n: '#884429', oL: 0.459, oC: 0.102, oH: 39.5, nL: 0.467, nC: 0.101, nH: 41.6 },
      { s: '80', o: '#7C3822', n: '#7C3A1F', oL: 0.427, oC: 0.101, oH: 38.4, nL: 0.43, nC: 0.1, nH: 41.8 },
      { s: '90', o: '#722F1B', n: '#713015', oL: 0.395, oC: 0.1, oH: 37.2, nL: 0.395, nC: 0.1, nH: 41.5 },
    ],
  },
  blueCheese: {
    hue: '203.3',
    why: 'Old ramp slid cyan→teal (199°→210°). Locked to 203°; the whole ramp is now one consistent cyan with even lightness steps.',
    rows: [
      { s: '10', o: '#6FF1F6', n: '#6CF0FC', oL: 0.887, oC: 0.115, oH: 198.7, nL: 0.886, nC: 0.116, nH: 203.4 },
      { s: '20', o: '#5CECF1', n: '#58E7F4', oL: 0.868, oC: 0.122, oH: 198.4, nL: 0.857, nC: 0.122, nH: 203.7 },
      { s: '30', o: '#45E5ED', n: '#3EDEEB', oL: 0.845, oC: 0.129, oH: 200.0, nL: 0.826, nC: 0.128, nH: 203.2 },
      { s: '40', o: '#2CDCE6', n: '#22D4E2', oL: 0.817, oC: 0.132, oH: 201.0, nL: 0.795, nC: 0.131, nH: 203.6 },
      { s: '50', o: '#0DCFDC', n: '#05CAD8', oL: 0.779, oC: 0.131, oH: 202.9, nL: 0.765, nC: 0.13, nH: 203.7 },
      { s: '60', o: '#08C0CE', n: '#00C0CC', oL: 0.737, oC: 0.125, oH: 204.2, nL: 0.736, nC: 0.125, nH: 202.8 },
      { s: '70', o: '#05B5C5', n: '#00B5C1', oL: 0.706, oC: 0.12, oH: 206.0, nL: 0.704, nC: 0.12, nH: 203.2 },
      { s: '80', o: '#02AABD', n: '#00ABB6', oL: 0.676, oC: 0.116, oH: 208.8, nL: 0.675, nC: 0.115, nH: 202.9 },
      { s: '90', o: '#009FB3', n: '#00A0AB', oL: 0.644, oC: 0.112, oH: 210.4, nL: 0.643, nC: 0.11, nH: 203.4 },
    ],
  },
  avocado: {
    hue: '152.0',
    why: 'Old ramp drifted mint→grass (163°→145°). Locked to 152° emerald with even lightness. Dark steps were nudged slightly less saturated to keep the hue stable in-gamut.',
    rows: [
      { s: '10', o: '#74F3BC', n: '#88F1A7', oL: 0.877, oC: 0.139, oH: 162.9, nL: 0.876, nC: 0.143, nH: 152.0 },
      { s: '20', o: '#65F1AE', n: '#77EB9B', oL: 0.864, oC: 0.155, oH: 159.6, nL: 0.852, nC: 0.155, nH: 151.9 },
      { s: '30', o: '#51EBA0', n: '#61E48D', oL: 0.841, oC: 0.168, oH: 158.1, nL: 0.824, nC: 0.169, nH: 151.9 },
      { s: '40', o: '#39E58C', n: '#43DE7F', oL: 0.816, oC: 0.186, oH: 155.0, nL: 0.798, nC: 0.185, nH: 152.1 },
      { s: '50', o: '#1DDC6F', n: '#11D871', oL: 0.785, oC: 0.206, oH: 150.9, nL: 0.774, nC: 0.201, nH: 152.0 },
      { s: '60', o: '#15CE5C', n: '#00CF6A', oL: 0.745, oC: 0.206, oH: 148.9, nL: 0.748, nC: 0.197, nH: 151.9 },
      { s: '70', o: '#0FC54F', n: '#00C565', oL: 0.719, oC: 0.207, oH: 147.7, nL: 0.721, nC: 0.19, nH: 152.0 },
      { s: '80', o: '#0ABD42', n: '#00BC60', oL: 0.696, oC: 0.208, oH: 146.4, nL: 0.696, nC: 0.183, nH: 151.9 },
      { s: '90', o: '#04B435', n: '#00B25B', oL: 0.67, oC: 0.208, oH: 145.4, nL: 0.669, nC: 0.176, nH: 152.0 },
    ],
  },
  lettuce: {
    hue: '131.8',
    why: 'Old ramp drifted 121°→138°. Locked to 132° lime. The very light tint (10) softened where near-white lime exceeds the sRGB gamut.',
    rows: [
      { s: '10', o: '#DBFE6C', n: '#CDFFA3', oL: 0.944, oC: 0.175, oH: 121.2, nL: 0.944, nC: 0.129, nH: 131.7 },
      { s: '20', o: '#CCFB5B', n: '#B5FF6F', oL: 0.926, oC: 0.191, oH: 124.1, nL: 0.922, nC: 0.191, nH: 131.9 },
      { s: '30', o: '#BDF849', n: '#AAF959', oL: 0.908, oC: 0.205, oH: 126.6, nL: 0.9, nC: 0.205, nH: 131.8 },
      { s: '40', o: '#ACF535', n: '#9FF33D', oL: 0.89, oC: 0.22, oH: 129.1, nL: 0.878, nC: 0.22, nH: 131.7 },
      { s: '50', o: '#92F21D', n: '#94ED10', oL: 0.868, oC: 0.238, oH: 132.8, nL: 0.856, nC: 0.234, nH: 131.7 },
      { s: '60', o: '#7DE914', n: '#8EE500', oL: 0.836, oC: 0.24, oH: 135.0, nL: 0.834, nC: 0.23, nH: 131.7 },
      { s: '70', o: '#6FE20F', n: '#89DD00', oL: 0.813, oC: 0.24, oH: 136.3, nL: 0.812, nC: 0.224, nH: 131.7 },
      { s: '80', o: '#62DB09', n: '#84D500', oL: 0.79, oC: 0.239, oH: 137.4, nL: 0.79, nC: 0.218, nH: 131.7 },
      { s: '90', o: '#58D404', n: '#7FCD00', oL: 0.768, oC: 0.237, oH: 138.1, nL: 0.767, nC: 0.212, nH: 131.6 },
    ],
  },
  cheese: {
    hue: '97.8',
    why: 'Signature yellow. Old drifted lemon→gold (106°→87°). Locked to 98°; the key 50 swatch is essentially unchanged. Light tints (10–40) softened because near-white yellow physically cannot hold high chroma in sRGB.',
    rows: [
      { s: '10', o: '#FFF76F', n: '#FFF2B3', oL: 0.957, oC: 0.156, oH: 105.9, nL: 0.957, nC: 0.081, nH: 97.8 },
      { s: '20', o: '#FFF35A', n: '#FFEC93', oL: 0.947, oC: 0.169, oH: 104.8, nL: 0.939, nC: 0.111, nH: 97.6 },
      { s: '30', o: '#FFEF40', n: '#FFE66E', oL: 0.937, oC: 0.181, oH: 103.9, nL: 0.922, nC: 0.142, nH: 97.7 },
      { s: '40', o: '#FFE923', n: '#FFE03B', oL: 0.923, oC: 0.188, oH: 102.2, nL: 0.906, nC: 0.172, nH: 97.9 },
      { s: '50', o: '#FFDF00', n: '#FCDA00', oL: 0.903, oC: 0.187, oH: 98.7, nL: 0.89, nC: 0.184, nH: 97.7 },
      { s: '60', o: '#FCD400', n: '#F5D400', oL: 0.878, oC: 0.18, oH: 95.1, nL: 0.871, nC: 0.18, nH: 97.7 },
      { s: '70', o: '#F9CC00', n: '#EFCF07', oL: 0.859, oC: 0.176, oH: 92.7, nL: 0.856, nC: 0.176, nH: 97.8 },
      { s: '80', o: '#F6C400', n: '#E9CA0B', oL: 0.841, oC: 0.172, oH: 90.0, nL: 0.84, nC: 0.172, nH: 97.8 },
      { s: '90', o: '#F3BC00', n: '#E2C406', oL: 0.822, oC: 0.168, oH: 87.3, nL: 0.821, nC: 0.169, nH: 97.9 },
    ],
  },
  bun: {
    hue: '47.3',
    why: 'Biggest drift fix: the old ramp swung amber→red-orange (69°→35°), so the tints and shades looked like different colors. Locked to 47° true orange — the whole ramp now reads as one hue.',
    rows: [
      { s: '10', o: '#FFB760', n: '#FFB38E', oL: 0.831, oC: 0.133, oH: 69.3, nL: 0.83, nC: 0.102, nH: 46.8 },
      { s: '20', o: '#FFAA55', n: '#FFA679', oL: 0.806, oC: 0.141, oH: 63.3, nL: 0.804, nC: 0.121, nH: 47.3 },
      { s: '30', o: '#FF9D48', n: '#FF9964', oL: 0.782, oC: 0.152, oH: 58.4, nL: 0.779, nC: 0.14, nH: 47.3 },
      { s: '40', o: '#FF8E3B', n: '#FF8A4B', oL: 0.756, oC: 0.165, oH: 53.0, nL: 0.751, nC: 0.161, nH: 47.0 },
      { s: '50', o: '#FF7A2B', n: '#FF7B2B', oL: 0.724, oC: 0.183, oH: 46.7, nL: 0.726, nC: 0.182, nH: 47.1 },
      { s: '60', o: '#FA6620', n: '#FA6F00', oL: 0.689, oC: 0.196, oH: 41.6, nL: 0.7, nC: 0.193, nH: 47.3 },
      { s: '70', o: '#F55919', n: '#ED6900', oL: 0.665, oC: 0.203, oH: 39.0, nL: 0.673, nC: 0.185, nH: 47.4 },
      { s: '80', o: '#F04C11', n: '#E16300', oL: 0.642, oC: 0.209, oH: 36.8, nL: 0.646, nC: 0.178, nH: 47.2 },
      { s: '90', o: '#EB3F0A', n: '#D55E00', oL: 0.621, oC: 0.215, oH: 34.8, nL: 0.621, nC: 0.17, nH: 47.5 },
    ],
  },
  ketchup: {
    hue: '28.7',
    why: 'Hue was already stable; the win here is even lightness. Old steps bunched up in the mid-range (L jumped 0.567→0.534→0.511); the new ramp spaces them evenly so each step feels like a real increment.',
    rows: [
      { s: '10', o: '#F3796C', n: '#F57869', oL: 0.714, oC: 0.152, oH: 27.7, nL: 0.715, nC: 0.156, nH: 28.6 },
      { s: '20', o: '#ED685C', n: '#EE6A5B', oL: 0.679, oC: 0.167, oH: 27.5, nL: 0.683, nC: 0.166, nH: 28.7 },
      { s: '30', o: '#E7574B', n: '#E9594B', oL: 0.645, oC: 0.181, oH: 28.0, nL: 0.651, nC: 0.181, nH: 28.6 },
      { s: '40', o: '#E04337', n: '#E4483B', oL: 0.609, oC: 0.196, oH: 28.6, nL: 0.621, nC: 0.195, nH: 28.7 },
      { s: '50', o: '#D52B20', n: '#DC372C', oL: 0.567, oC: 0.206, oH: 29.2, nL: 0.59, nC: 0.203, nH: 28.8 },
      { s: '60', o: '#C72017', n: '#D02B22', oL: 0.534, oC: 0.201, oH: 29.2, nL: 0.558, nC: 0.202, nH: 28.8 },
      { s: '70', o: '#BD1911', n: '#C3211B', oL: 0.511, oC: 0.197, oH: 29.2, nL: 0.527, nC: 0.197, nH: 28.6 },
      { s: '80', o: '#B3110B', n: '#B61612', oL: 0.487, oC: 0.192, oH: 29.2, nL: 0.496, nC: 0.192, nH: 28.7 },
      { s: '90', o: '#A90A05', n: '#AA0607', oL: 0.465, oC: 0.186, oH: 29.3, nL: 0.466, nC: 0.188, nH: 28.7 },
    ],
  },
  bacon: {
    hue: '8.3',
    why: 'Old ramp crossed the hue wrap pink→red (353°→20°), the worst drift in the system. Locked to 8° rose-red so the ramp stays coherent from tint to shade.',
    rows: [
      { s: '10', o: '#FE7AB6', n: '#FF7F9A', oL: 0.749, oC: 0.172, oH: 353.5, nL: 0.749, nC: 0.157, nH: 8.3 },
      { s: '20', o: '#FD6EA9', n: '#FF7091', oL: 0.728, oC: 0.183, oH: 356.8, nL: 0.726, nC: 0.176, nH: 8.2 },
      { s: '30', o: '#FD619D', n: '#FF5F87', oL: 0.709, oC: 0.197, oH: 359.6, nL: 0.703, nC: 0.196, nH: 8.4 },
      { s: '40', o: '#FC538D', n: '#FC4F7F', oL: 0.688, oC: 0.208, oH: 3.4, nL: 0.68, nC: 0.21, nH: 8.1 },
      { s: '50', o: '#FC4079', n: '#F83F77', oL: 0.665, oC: 0.224, oH: 8.1, nL: 0.657, nC: 0.221, nH: 8.1 },
      { s: '60', o: '#F33163', n: '#F1326F', oL: 0.634, oC: 0.226, oH: 12.7, nL: 0.634, nC: 0.225, nH: 8.4 },
      { s: '70', o: '#EA2654', n: '#E82769', oL: 0.609, oC: 0.225, oH: 15.5, nL: 0.61, nC: 0.225, nH: 8.1 },
      { s: '80', o: '#E21C48', n: '#DF1C62', oL: 0.587, oC: 0.223, oH: 17.6, nL: 0.587, nC: 0.223, nH: 8.3 },
      { s: '90', o: '#D9113A', n: '#D60D5C', oL: 0.564, oC: 0.221, oH: 20.2, nL: 0.564, nC: 0.221, nH: 8.2 },
    ],
  },
  cabbage: {
    hue: '315.3',
    why: 'The brand accent. Old ramp drifted 322°→308°. Locked to 315°; the core 50 swatch is virtually unchanged (#C029F0→#BC29EC, < 1.5 ΔL) so brand recognition is intact, while the tints and shades now agree on one hue.',
    rows: [
      { s: '10', o: '#E669FB', n: '#D775FF', oL: 0.726, oC: 0.231, oH: 321.7, nL: 0.726, nC: 0.211, nH: 315.2 },
      { s: '20', o: '#E05CF8', n: '#D361FF', oL: 0.702, oC: 0.243, oH: 321.2, nL: 0.696, nC: 0.238, nH: 315.3 },
      { s: '30', o: '#D74CF6', n: '#CD4EFC', oL: 0.674, oC: 0.257, oH: 319.7, nL: 0.666, nC: 0.256, nH: 315.3 },
      { s: '40', o: '#CE3DF3', n: '#C53CF5', oL: 0.647, oC: 0.267, oH: 318.4, nL: 0.636, nC: 0.267, nH: 315.4 },
      { s: '50', o: '#C029F0', n: '#BC29EC', oL: 0.613, oC: 0.277, oH: 315.8, nL: 0.604, nC: 0.272, nH: 315.5 },
      { s: '60', o: '#AC1DE4', n: '#B11BE1', oL: 0.57, oC: 0.269, oH: 312.9, nL: 0.574, nC: 0.269, nH: 315.2 },
      { s: '70', o: '#9E15D9', n: '#A60FD3', oL: 0.539, oC: 0.261, oH: 311.3, nL: 0.544, nC: 0.261, nH: 315.5 },
      { s: '80', o: '#900DCF', n: '#9A00C6', oL: 0.509, oC: 0.253, oH: 309.2, nL: 0.513, nC: 0.253, nH: 315.1 },
      { s: '90', o: '#8505C4', n: '#8E00B6', oL: 0.483, oC: 0.244, oH: 308.2, nL: 0.483, nC: 0.237, nH: 315.4 },
    ],
  },
  onion: {
    hue: '284.9',
    why: 'Secondary brand violet. Old drifted lavender→indigo (296°→277°). Locked to 285° so cabbage→onion gradients keep a clean, predictable violet relationship.',
    rows: [
      { s: '10', o: '#9D70F8', n: '#8878FF', oL: 0.654, oC: 0.195, oH: 295.8, nL: 0.653, nC: 0.193, nH: 285.1 },
      { s: '20', o: '#8D62F4', n: '#7E6AFB', oL: 0.615, oC: 0.209, oH: 292.8, nL: 0.619, nC: 0.208, nH: 284.9 },
      { s: '30', o: '#8055F0', n: '#755BF6', oL: 0.581, oC: 0.22, oH: 290.6, nL: 0.585, nC: 0.221, nH: 285.0 },
      { s: '40', o: '#7147ED', n: '#6C4BF1', oL: 0.546, oC: 0.234, oH: 287.6, nL: 0.55, nC: 0.234, nH: 284.8 },
      { s: '50', o: '#5F37E9', n: '#643BE8', oL: 0.507, oC: 0.246, oH: 283.6, nL: 0.515, nC: 0.241, nH: 285.1 },
      { s: '60', o: '#4E2CD7', n: '#5B2FDB', oL: 0.463, oC: 0.238, oH: 280.8, nL: 0.482, nC: 0.238, nH: 284.8 },
      { s: '70', o: '#4325C8', n: '#5225CA', oL: 0.432, oC: 0.229, oH: 279.2, nL: 0.447, nC: 0.229, nH: 284.8 },
      { s: '80', o: '#3B1EBA', n: '#4A1ABA', oL: 0.403, oC: 0.22, oH: 278.4, nL: 0.413, nC: 0.22, nH: 285.0 },
      { s: '90', o: '#3319AD', n: '#420BAB', oL: 0.378, oC: 0.211, oH: 277.2, nL: 0.379, nC: 0.214, nH: 285.0 },
    ],
  },
  water: {
    hue: '263.2',
    why: 'Old drifted 257°→265°. Locked to 263° azure with even lightness. Darkest shade pulled slightly in-gamut to keep the hue true.',
    rows: [
      { s: '10', o: '#68A6FC', n: '#74A2FF', oL: 0.721, oC: 0.142, oH: 256.8, nL: 0.72, nC: 0.145, nH: 263.3 },
      { s: '20', o: '#5C9BFA', n: '#6696FA', oL: 0.691, oC: 0.155, oH: 258.4, nL: 0.685, nC: 0.157, nH: 263.5 },
      { s: '30', o: '#508CF9', n: '#558AF8', oL: 0.654, oC: 0.174, oH: 261.3, nL: 0.651, nC: 0.174, nH: 263.1 },
      { s: '40', o: '#427EF7', n: '#437CF7', oL: 0.618, oC: 0.192, oH: 262.4, nL: 0.614, nC: 0.194, nH: 263.2 },
      { s: '50', o: '#3169F5', n: '#316EF7', oL: 0.569, oC: 0.218, oH: 264.1, nL: 0.58, nC: 0.215, nH: 263.2 },
      { s: '60', o: '#2556ED', n: '#1F5FF3', oL: 0.524, oC: 0.233, oH: 265.0, nL: 0.544, nC: 0.231, nH: 263.2 },
      { s: '70', o: '#1D49E6', n: '#0F51EC', oL: 0.493, oC: 0.24, oH: 265.2, nL: 0.51, nC: 0.24, nH: 263.2 },
      { s: '80', o: '#153CE0', n: '#0044E1', oL: 0.465, oC: 0.247, oH: 265.2, nL: 0.475, nC: 0.243, nH: 263.1 },
      { s: '90', o: '#0D31D9', n: '#003CCC', oL: 0.44, oC: 0.25, oH: 265.0, nL: 0.44, nC: 0.226, nH: 263.2 },
    ],
  },
  salt: {
    hue: '266.8',
    why: 'Light-surface neutral. Kept ultra-low chroma and locked the cool hue (~267°) so the light greys stay a consistent, barely-tinted neutral. Change is near-imperceptible by design — neutrals must stay neutral so accents read clearly.',
    rows: [
      { s: '0', o: '#FFFFFF', n: '#FFFFFF', oL: 1, oC: 0, oH: 89.9, nL: 1, nC: 0, nH: 89.9 },
      { s: '10', o: '#F5F8FC', n: '#F5F6FA', oL: 0.978, oC: 0.006, oH: 255.5, nL: 0.974, nC: 0.005, nH: 275.0 },
      { s: '20', o: '#EDF0F7', n: '#EBEEF5', oL: 0.955, oC: 0.01, oH: 267.4, nL: 0.949, nC: 0.01, nH: 267.4 },
      { s: '30', o: '#E4E9F2', n: '#E1E5EF', oL: 0.933, oC: 0.013, oH: 262.4, nL: 0.922, nC: 0.014, nH: 268.5 },
      { s: '40', o: '#DBE1ED', n: '#D7DDE9', oL: 0.909, oC: 0.018, oH: 264.5, nL: 0.897, nC: 0.018, nH: 264.5 },
      { s: '50', o: '#CFD6E6', n: '#CDD4E4', oL: 0.876, oC: 0.023, oH: 266.9, nL: 0.869, nC: 0.023, nH: 266.9 },
      { s: '60', o: '#C2CADE', n: '#C3CCE0', oL: 0.839, oC: 0.029, oH: 268.3, nL: 0.844, nC: 0.03, nH: 266.3 },
      { s: '70', o: '#B9C2D9', n: '#BAC4DA', oL: 0.814, oC: 0.034, oH: 268.6, nL: 0.82, nC: 0.033, nH: 266.1 },
      { s: '80', o: '#B0BBD4', n: '#B1BBD5', oL: 0.792, oC: 0.038, oH: 266.6, nL: 0.793, nC: 0.039, nH: 268.8 },
      { s: '90', o: '#A8B3CF', n: '#A8B3CE', oL: 0.767, oC: 0.042, oH: 268.4, nL: 0.767, nC: 0.041, nH: 267.9 },
    ],
  },
  pepper: {
    hue: '266.4',
    why: 'Dark-surface neutral (page canvas, cards, sidebar). Ultra-low chroma preserved and hue locked; the values are essentially unchanged. Surfaces stay near-black neutral on purpose — the purple personality comes from the accent, never the background.',
    rows: [
      { s: '10', o: '#525866', n: '#525866', oL: 0.46, oC: 0.024, oH: 267.0, nL: 0.46, nC: 0.024, nH: 267.0 },
      { s: '20', o: '#494E5B', n: '#494E5B', oL: 0.424, oC: 0.023, oH: 268.8, nL: 0.424, nC: 0.023, nH: 268.8 },
      { s: '30', o: '#404551', n: '#404551', oL: 0.39, oC: 0.021, oH: 267.5, nL: 0.39, nC: 0.021, nH: 267.5 },
      { s: '40', o: '#383C47', n: '#373C46', oL: 0.357, oC: 0.02, oH: 269.6, nL: 0.355, nC: 0.019, nH: 264.3 },
      { s: '50', o: '#2D313A', n: '#2F333C', oL: 0.313, oC: 0.017, oH: 266.4, nL: 0.321, nC: 0.017, nH: 266.4 },
      { s: '60', o: '#22262D', n: '#272A32', oL: 0.268, oC: 0.014, oH: 261.7, nL: 0.285, nC: 0.015, nH: 269.1 },
      { s: '70', o: '#1C1F26', n: '#1F2228', oL: 0.239, oC: 0.014, oH: 267.0, nL: 0.251, nC: 0.012, nH: 264.3 },
      { s: '80', o: '#17191F', n: '#171920', oL: 0.214, oC: 0.012, oH: 270.8, nL: 0.214, nC: 0.014, nH: 272.6 },
      { s: '90', o: '#0E1217', n: '#0F1217', oL: 0.18, oC: 0.012, oH: 254.1, nL: 0.181, nC: 0.011, nH: 260.6 },
    ],
  },
};

const FAMILY_ORDER = Object.keys(DATA);

const td: React.CSSProperties = {
  padding: '6px 10px',
  borderBottom: '1px solid rgba(128,128,128,0.25)',
  fontSize: 12,
  textAlign: 'left',
  whiteSpace: 'nowrap',
};
const th: React.CSSProperties = { ...td, fontWeight: 700, opacity: 0.7 };
const mono: React.CSSProperties = { fontFamily: 'ui-monospace, monospace' };

const Swatch = ({ hex, size = 40 }: { hex: string; size?: number }) => (
  <div
    title={hex}
    style={{
      width: size,
      height: size,
      background: hex,
      borderRadius: 6,
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)',
    }}
  />
);

const Ramp = ({ rows, which }: { rows: Row[]; which: 'o' | 'n' }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {rows.map((r) => (
      <div key={r.s} style={{ textAlign: 'center' }}>
        <Swatch hex={r[which]} />
        <div style={{ fontSize: 9, opacity: 0.6, marginTop: 2 }}>{r.s}</div>
      </div>
    ))}
  </div>
);

const FamilyBlock = ({ name }: { name: string }) => {
  const fam = DATA[name];
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 2px', textTransform: 'capitalize' }}>
        {name}
        <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.6, marginLeft: 10 }}>
          locked hue {fam.hue}°
        </span>
      </h2>
      <p style={{ fontSize: 13, lineHeight: 1.5, maxWidth: 760, opacity: 0.85, margin: '0 0 14px' }}>
        {fam.why}
      </p>

      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, marginBottom: 6 }}>BEFORE</div>
          <Ramp rows={fam.rows} which="o" />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, marginBottom: 6 }}>AFTER (OKLCH)</div>
          <Ramp rows={fam.rows} which="n" />
        </div>
      </div>

      <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: 900 }}>
        <thead>
          <tr>
            <th style={th}>Step</th>
            <th style={th}>Old hex</th>
            <th style={th}>New hex</th>
            <th style={th}>L (old→new)</th>
            <th style={th}>C (old→new)</th>
            <th style={th}>H° (old→new)</th>
          </tr>
        </thead>
        <tbody>
          {fam.rows.map((r) => {
            const hueShift = Math.abs(r.nH - r.oH);
            return (
              <tr key={r.s}>
                <td style={{ ...td, fontWeight: 700 }}>{r.s}</td>
                <td style={{ ...td, ...mono }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Swatch hex={r.o} size={14} />
                    {r.o}
                  </span>
                </td>
                <td style={{ ...td, ...mono }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Swatch hex={r.n} size={14} />
                    {r.n}
                  </span>
                </td>
                <td style={{ ...td, ...mono }}>
                  {r.oL.toFixed(3)} → {r.nL.toFixed(3)}
                </td>
                <td style={{ ...td, ...mono }}>
                  {r.oC.toFixed(3)} → {r.nC.toFixed(3)}
                </td>
                <td style={{ ...td, ...mono, color: hueShift > 6 ? '#e0699b' : undefined }}>
                  {r.oH.toFixed(1)} → {r.nH.toFixed(1)}
                  {hueShift > 6 ? `  (−${hueShift.toFixed(0)}° drift removed)` : ''}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
};

const meta: Meta = {
  title: 'Tokens/Palette OKLCH Rebuild',
};
export default meta;
type Story = StoryObj;

export const Methodology: Story = {
  name: 'Why & How',
  render: () => (
    <div style={{ padding: 24, maxWidth: 880, lineHeight: 1.6 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
        OKLCH palette rebuild — what changed and why
      </h1>
      <p style={{ opacity: 0.85 }}>
        The old ramps were authored in HSL/hand-tuned hex. Two problems compound across a 9-step
        ramp: the <strong>hue drifts</strong> as you go lighter/darker (so a single &ldquo;family&rdquo;
        actually spans several hues), and the <strong>lightness steps are uneven</strong> (some
        jumps are twice as big as others). Rebuilding in <strong>OKLCH</strong> — a
        perceptually-uniform space where L, Chroma and Hue are independent — fixes both.
      </p>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 20 }}>The four rules applied to every family</h3>
      <ol style={{ opacity: 0.85, paddingLeft: 20 }}>
        <li>
          <strong>One locked hue per family.</strong> We take the chroma-weighted average hue of the
          old ramp and pin every step to it. This is the headline fix — e.g. <em>bun</em> swung from
          69° (amber) to 35° (red-orange); it&rsquo;s now a single 47° orange.
        </li>
        <li>
          <strong>Evenly-spaced perceptual lightness.</strong> L is distributed linearly between the
          family&rsquo;s existing lightest and darkest endpoints, so the visual range is unchanged but
          each step is a real, equal increment.
        </li>
        <li>
          <strong>Chroma intensity preserved, gamut-fit.</strong> We keep each step&rsquo;s original
          saturation (lightly smoothed) and only reduce it where the color falls outside sRGB — which
          is why the vivid darks stay vivid and only near-white tints soften.
        </li>
        <li>
          <strong>Neutrals stay neutral.</strong> salt &amp; pepper keep their ultra-low chroma so the
          brand accent always reads clearly against the surface. The change there is intentionally
          near-invisible.
        </li>
      </ol>
      <p style={{ opacity: 0.85 }}>
        Token names, shade levels, semantic mapping and overlay opacity percentages are all unchanged —
        only the underlying hex values move, so everything cascades automatically through
        <code> --theme-* </code> in base.css. Scroll to the <strong>Comparison</strong> story for the
        full old-vs-new table per family.
      </p>
      <p style={{ fontSize: 12, opacity: 0.6, marginTop: 16 }}>
        References: OKLCH color model (jakub.kr / oklch.fyi), interfaces.dev craft principles.
      </p>
    </div>
  ),
};

export const Comparison: Story = {
  name: 'Comparison (all families)',
  render: () => (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Old vs. new palette</h1>
      <p style={{ opacity: 0.75, marginBottom: 28, maxWidth: 760 }}>
        Hue shifts greater than 6° (the drift being removed) are highlighted. Lightness and chroma
        are shown in OKLCH units (L 0–1, C 0–0.4).
      </p>
      {FAMILY_ORDER.map((name) => (
        <FamilyBlock key={name} name={name} />
      ))}
    </div>
  ),
};
