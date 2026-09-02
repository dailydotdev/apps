import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * OKLCH palette rebuild — dark-mode-first tuning. Old (original) vs. new (shipped).
 *
 * Built in two layers:
 *  1. Perceptual-uniformity rebuild — one locked hue per family (kills HSL hue-drift)
 *     and evenly-spaced OKLCH lightness between each family endpoints.
 *  2. Dark-mode tuning (dark is the primary theme):
 *     - Chroma soft-cap: chroma above ~0.16 is compressed by half, so the buzziest
 *       families stop vibrating/halating on near-black; calm families are untouched.
 *     - Light-tint lift: the lightest foreground tints are nudged toward white for
 *       crisp legibility on dark — never the solid mid-fill steps, so white-on-button
 *       contrast is preserved.
 *     - Neutral elevation: pepper is a clean, evenly-spaced ramp at a constant faint
 *       cool tint, so each raised dark surface is a deliberate step lighter.
 *
 * Hex values match what now ships in packages/shared/tailwind/colors.ts.
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
    hue: "41.6",
    why:
      "Muted earth tone — already calm, so chroma is left alone. Hue locked to 41.6° (old ramp drifted 45°→37°) and lightness evened. Pure perceptual-uniformity cleanup.",
    rows: [
      { s: "10", o: "#C98464", n: "#CA8368", oL: 0.677, oC: 0.097, oH: 45.5, nL: 0.677, nC: 0.096, nH: 41.6 },
      { s: "20", o: "#C07A5B", n: "#BF785D", oL: 0.646, oC: 0.098, oH: 44.5, nL: 0.642, nC: 0.098, nH: 41.5 },
      { s: "30", o: "#B67052", n: "#B46D52", oL: 0.614, oC: 0.099, oH: 43.7, nL: 0.606, nC: 0.099, nH: 41.4 },
      { s: "40", o: "#AD6648", n: "#AA6247", oL: 0.583, oC: 0.101, oH: 43.3, nL: 0.572, nC: 0.102, nH: 41.1 },
      { s: "50", o: "#A0583C", n: "#9F573C", oL: 0.539, oC: 0.104, oH: 41.6, nL: 0.536, nC: 0.103, nH: 41 },
      { s: "60", o: "#914B31", n: "#934D32", oL: 0.493, oC: 0.102, oH: 40.7, nL: 0.5, nC: 0.102, nH: 41.3 },
      { s: "70", o: "#864129", n: "#884429", oL: 0.459, oC: 0.102, oH: 39.5, nL: 0.467, nC: 0.101, nH: 41.6 },
      { s: "80", o: "#7C3822", n: "#7C3A1F", oL: 0.427, oC: 0.101, oH: 38.4, nL: 0.43, nC: 0.1, nH: 41.8 },
      { s: "90", o: "#722F1B", n: "#713015", oL: 0.395, oC: 0.1, oH: 37.2, nL: 0.395, nC: 0.1, nH: 41.5 },
    ],
  },
  blueCheese: {
    hue: "203.3",
    why:
      "Locked to 203° (old slid 199°→210°). Chroma is low enough that no dark-mode taming was needed — just hue + lightness consistency.",
    rows: [
      { s: "10", o: "#6FF1F6", n: "#6EF2FE", oL: 0.887, oC: 0.115, oH: 198.7, nL: 0.892, nC: 0.117, nH: 203.4 },
      { s: "20", o: "#5CECF1", n: "#5BEAF6", oL: 0.868, oC: 0.122, oH: 198.4, nL: 0.865, nC: 0.122, nH: 203 },
      { s: "30", o: "#45E5ED", n: "#43E1EE", oL: 0.845, oC: 0.129, oH: 200, nL: 0.835, nC: 0.128, nH: 203.2 },
      { s: "40", o: "#2CDCE6", n: "#29D8E5", oL: 0.817, oC: 0.132, oH: 201, nL: 0.806, nC: 0.131, nH: 203 },
      { s: "50", o: "#0DCFDC", n: "#16CEDB", oL: 0.779, oC: 0.131, oH: 202.9, nL: 0.777, nC: 0.13, nH: 203.1 },
      { s: "60", o: "#08C0CE", n: "#13C4D1", oL: 0.737, oC: 0.125, oH: 204.2, nL: 0.748, nC: 0.125, nH: 203.4 },
      { s: "70", o: "#05B5C5", n: "#00B5C1", oL: 0.706, oC: 0.12, oH: 206, nL: 0.704, nC: 0.12, nH: 203.2 },
      { s: "80", o: "#02AABD", n: "#00ABB6", oL: 0.676, oC: 0.116, oH: 208.8, nL: 0.675, nC: 0.115, nH: 202.9 },
      { s: "90", o: "#009FB3", n: "#00A0AB", oL: 0.644, oC: 0.112, oH: 210.4, nL: 0.643, nC: 0.11, nH: 203.4 },
    ],
  },
  avocado: {
    hue: "152.0",
    why:
      "Locked 152° emerald (old drifted 163°→145°). Mid/dark chroma eased so the green stops vibrating against near-black.",
    rows: [
      { s: "10", o: "#74F3BC", n: "#8AF4A9", oL: 0.877, oC: 0.139, oH: 162.9, nL: 0.884, nC: 0.144, nH: 151.9 },
      { s: "20", o: "#65F1AE", n: "#79ED9D", oL: 0.864, oC: 0.155, oH: 159.6, nL: 0.858, nC: 0.155, nH: 152 },
      { s: "30", o: "#51EBA0", n: "#68E792", oL: 0.841, oC: 0.168, oH: 158.1, nL: 0.835, nC: 0.165, nH: 152 },
      { s: "40", o: "#39E58C", n: "#57E087", oL: 0.816, oC: 0.186, oH: 155, nL: 0.81, nC: 0.173, nH: 151.9 },
      { s: "50", o: "#1DDC6F", n: "#44D97C", oL: 0.785, oC: 0.206, oH: 150.9, nL: 0.786, nC: 0.181, nH: 151.8 },
      { s: "60", o: "#15CE5C", n: "#34D174", oL: 0.745, oC: 0.206, oH: 148.9, nL: 0.76, nC: 0.183, nH: 152.1 },
      { s: "70", o: "#0FC54F", n: "#26C96C", oL: 0.719, oC: 0.207, oH: 147.7, nL: 0.736, nC: 0.184, nH: 152 },
      { s: "80", o: "#0ABD42", n: "#00BC60", oL: 0.696, oC: 0.208, oH: 146.4, nL: 0.696, nC: 0.183, nH: 151.9 },
      { s: "90", o: "#04B435", n: "#00B25B", oL: 0.67, oC: 0.208, oH: 145.4, nL: 0.669, nC: 0.176, nH: 152 },
    ],
  },
  lettuce: {
    hue: "131.8",
    why:
      "Locked 132° lime (old drifted 121°→138°). High-energy lime — chroma softened across the ramp so it calms down on dark surfaces.",
    rows: [
      { s: "10", o: "#DBFE6C", n: "#CFFFA8", oL: 0.944, oC: 0.175, oH: 121.2, nL: 0.946, nC: 0.123, nH: 131.9 },
      { s: "20", o: "#CCFB5B", n: "#BBFE7D", oL: 0.926, oC: 0.191, oH: 124.1, nL: 0.925, nC: 0.174, nH: 131.7 },
      { s: "30", o: "#BDF849", n: "#B2F86F", oL: 0.908, oC: 0.205, oH: 126.6, nL: 0.905, nC: 0.183, nH: 131.7 },
      { s: "40", o: "#ACF535", n: "#A9F261", oL: 0.89, oC: 0.22, oH: 129.1, nL: 0.884, nC: 0.191, nH: 131.8 },
      { s: "50", o: "#92F21D", n: "#A1EC53", oL: 0.868, oC: 0.238, oH: 132.8, nL: 0.864, nC: 0.198, nH: 131.7 },
      { s: "60", o: "#7DE914", n: "#99E548", oL: 0.836, oC: 0.24, oH: 135, nL: 0.843, nC: 0.2, nH: 131.8 },
      { s: "70", o: "#6FE20F", n: "#93DE40", oL: 0.813, oC: 0.24, oH: 136.3, nL: 0.822, nC: 0.2, nH: 131.8 },
      { s: "80", o: "#62DB09", n: "#8CD737", oL: 0.79, oC: 0.239, oH: 137.4, nL: 0.801, nC: 0.2, nH: 131.9 },
      { s: "90", o: "#58D404", n: "#86D02F", oL: 0.768, oC: 0.237, oH: 138.1, nL: 0.78, nC: 0.199, nH: 131.8 },
    ],
  },
  cheese: {
    hue: "97.8",
    why:
      "Signature yellow, locked 98° (old drifted 106°→87°). Light tints soften where near-white yellow exits the sRGB gamut; mid/dark chroma gently tamed for dark mode.",
    rows: [
      { s: "10", o: "#FFF76F", n: "#FFF3B7", oL: 0.957, oC: 0.156, oH: 105.9, nL: 0.959, nC: 0.077, nH: 98.1 },
      { s: "20", o: "#FFF35A", n: "#FFED99", oL: 0.947, oC: 0.169, oH: 104.8, nL: 0.942, nC: 0.106, nH: 97.6 },
      { s: "30", o: "#FFEF40", n: "#FFE877", oL: 0.937, oC: 0.181, oH: 103.9, nL: 0.927, nC: 0.136, nH: 98 },
      { s: "40", o: "#FFE923", n: "#FFE24C", oL: 0.923, oC: 0.188, oH: 102.2, nL: 0.911, nC: 0.164, nH: 98 },
      { s: "50", o: "#FFDF00", n: "#FBDC34", oL: 0.903, oC: 0.187, oH: 98.7, nL: 0.894, nC: 0.173, nH: 97.9 },
      { s: "60", o: "#FCD400", n: "#F6D731", oL: 0.878, oC: 0.18, oH: 95.1, nL: 0.88, nC: 0.17, nH: 97.7 },
      { s: "70", o: "#F9CC00", n: "#F0D22E", oL: 0.859, oC: 0.176, oH: 92.7, nL: 0.864, nC: 0.168, nH: 97.9 },
      { s: "80", o: "#F6C400", n: "#EACC2A", oL: 0.841, oC: 0.172, oH: 90, nL: 0.846, nC: 0.165, nH: 97.6 },
      { s: "90", o: "#F3BC00", n: "#E5C723", oL: 0.822, oC: 0.168, oH: 87.3, nL: 0.831, nC: 0.165, nH: 97.6 },
    ],
  },
  bun: {
    hue: "47.3",
    why:
      "Biggest hue fix: old swung amber→red-orange (69°→35°), now a single 47° orange. Chroma eased so it reads warm, not glaring, on dark.",
    rows: [
      { s: "10", o: "#FFB760", n: "#FFB794", oL: 0.831, oC: 0.133, oH: 69.3, nL: 0.839, nC: 0.096, nH: 46.9 },
      { s: "20", o: "#FFAA55", n: "#FFAB81", oL: 0.806, oC: 0.141, oH: 63.3, nL: 0.814, nC: 0.114, nH: 47.2 },
      { s: "30", o: "#FF9D48", n: "#FF9F6D", oL: 0.782, oC: 0.152, oH: 58.4, nL: 0.79, nC: 0.132, nH: 47.7 },
      { s: "40", o: "#FF8E3B", n: "#FF9157", oL: 0.756, oC: 0.165, oH: 53, nL: 0.764, nC: 0.152, nH: 47.2 },
      { s: "50", o: "#FF7A2B", n: "#FF833D", oL: 0.724, oC: 0.183, oH: 46.7, nL: 0.739, nC: 0.171, nH: 47.2 },
      { s: "60", o: "#FA6620", n: "#F37426", oL: 0.689, oC: 0.196, oH: 41.6, nL: 0.698, nC: 0.177, nH: 47.1 },
      { s: "70", o: "#F55919", n: "#EC6B0F", oL: 0.665, oC: 0.203, oH: 39, nL: 0.674, nC: 0.181, nH: 47.4 },
      { s: "80", o: "#F04C11", n: "#E16300", oL: 0.642, oC: 0.209, oH: 36.8, nL: 0.646, nC: 0.178, nH: 47.2 },
      { s: "90", o: "#EB3F0A", n: "#D55E00", oL: 0.621, oC: 0.215, oH: 34.8, nL: 0.621, nC: 0.17, nH: 47.5 },
    ],
  },
  ketchup: {
    hue: "28.7",
    why:
      "Locked 29° with even lightness. Chroma softened a touch so the red does not halate against the dark canvas.",
    rows: [
      { s: "10", o: "#F3796C", n: "#F57869", oL: 0.714, oC: 0.152, oH: 27.7, nL: 0.715, nC: 0.156, nH: 28.6 },
      { s: "20", o: "#ED685C", n: "#ED6B5C", oL: 0.679, oC: 0.167, oH: 27.5, nL: 0.683, nC: 0.164, nH: 28.7 },
      { s: "30", o: "#E7574B", n: "#E55E50", oL: 0.645, oC: 0.181, oH: 28, nL: 0.652, nC: 0.171, nH: 28.6 },
      { s: "40", o: "#E04337", n: "#DD5143", oL: 0.609, oC: 0.196, oH: 28.6, nL: 0.621, nC: 0.178, nH: 28.9 },
      { s: "50", o: "#D52B20", n: "#D34438", oL: 0.567, oC: 0.206, oH: 29.2, nL: 0.589, nC: 0.181, nH: 28.6 },
      { s: "60", o: "#C72017", n: "#C83A2F", oL: 0.534, oC: 0.201, oH: 29.2, nL: 0.559, nC: 0.181, nH: 28.7 },
      { s: "70", o: "#BD1911", n: "#BC3026", oL: 0.511, oC: 0.197, oH: 29.2, nL: 0.527, nC: 0.178, nH: 28.8 },
      { s: "80", o: "#B3110B", n: "#B0261E", oL: 0.487, oC: 0.192, oH: 29.2, nL: 0.496, nC: 0.175, nH: 28.7 },
      { s: "90", o: "#A90A05", n: "#A51A14", oL: 0.465, oC: 0.186, oH: 29.3, nL: 0.465, nC: 0.174, nH: 28.8 },
    ],
  },
  bacon: {
    hue: "8.3",
    why:
      "Old crossed the pink→red hue wrap (353°→20°) — now locked 8° rose. Chroma eased for a calmer accent on dark.",
    rows: [
      { s: "10", o: "#FE7AB6", n: "#FF879F", oL: 0.749, oC: 0.172, oH: 353.5, nL: 0.762, nC: 0.147, nH: 8.5 },
      { s: "20", o: "#FD6EA9", n: "#FF7996", oL: 0.728, oC: 0.183, oH: 356.8, nL: 0.74, nC: 0.165, nH: 8.4 },
      { s: "30", o: "#FD619D", n: "#F86789", oL: 0.709, oC: 0.197, oH: 359.6, nL: 0.703, nC: 0.179, nH: 8.4 },
      { s: "40", o: "#FC538D", n: "#F25D82", oL: 0.688, oC: 0.208, oH: 3.4, nL: 0.68, nC: 0.185, nH: 8.2 },
      { s: "50", o: "#FC4079", n: "#EC527A", oL: 0.665, oC: 0.224, oH: 8.1, nL: 0.657, nC: 0.191, nH: 8.3 },
      { s: "60", o: "#F33163", n: "#E44973", oL: 0.634, oC: 0.226, oH: 12.7, nL: 0.633, nC: 0.192, nH: 8.3 },
      { s: "70", o: "#EA2654", n: "#DC416D", oL: 0.609, oC: 0.225, oH: 15.5, nL: 0.611, nC: 0.192, nH: 8 },
      { s: "80", o: "#E21C48", n: "#D33966", oL: 0.587, oC: 0.223, oH: 17.6, nL: 0.587, nC: 0.191, nH: 8.1 },
      { s: "90", o: "#D9113A", n: "#CB3160", oL: 0.564, oC: 0.221, oH: 20.2, nL: 0.565, nC: 0.191, nH: 8.1 },
    ],
  },
  cabbage: {
    hue: "315.3",
    why:
      "Brand accent. Locked 315°; chroma pulled from ~0.27 down to ~0.21 — the single biggest dark-mode win, because a max-chroma purple buzzes hardest on near-black. White-on-button contrast is preserved (3.81, ≥ the original 3.76) and accent-text hits 7.47 (AAA) on the dark canvas.",
    rows: [
      { s: "10", o: "#E669FB", n: "#D97EFE", oL: 0.726, oC: 0.231, oH: 321.7, nL: 0.74, nC: 0.197, nH: 315.4 },
      { s: "20", o: "#E05CF8", n: "#CB6EF1", oL: 0.702, oC: 0.243, oH: 321.2, nL: 0.695, nC: 0.202, nH: 315.2 },
      { s: "30", o: "#D74CF6", n: "#C362E9", oL: 0.674, oC: 0.257, oH: 319.7, nL: 0.665, nC: 0.209, nH: 315.4 },
      { s: "40", o: "#CE3DF3", n: "#BA56E1", oL: 0.647, oC: 0.267, oH: 318.4, nL: 0.635, nC: 0.214, nH: 315.3 },
      { s: "50", o: "#C029F0", n: "#B14BD7", oL: 0.613, oC: 0.277, oH: 315.8, nL: 0.605, nC: 0.216, nH: 315.5 },
      { s: "60", o: "#AC1DE4", n: "#A641CC", oL: 0.57, oC: 0.269, oH: 312.9, nL: 0.573, nC: 0.215, nH: 315.3 },
      { s: "70", o: "#9E15D9", n: "#9C39C1", oL: 0.539, oC: 0.261, oH: 311.3, nL: 0.544, nC: 0.21, nH: 315.2 },
      { s: "80", o: "#900DCF", n: "#9230B5", oL: 0.509, oC: 0.253, oH: 309.2, nL: 0.514, nC: 0.206, nH: 315.5 },
      { s: "90", o: "#8505C4", n: "#8826AA", oL: 0.483, oC: 0.244, oH: 308.2, nL: 0.483, nC: 0.203, nH: 315.5 },
    ],
  },
  onion: {
    hue: "284.9",
    why:
      "Secondary brand violet, locked 285° (old drifted 296°→277°). Chroma eased so cabbage→onion gradients stay smooth and non-vibrating.",
    rows: [
      { s: "10", o: "#9D70F8", n: "#887BF8", oL: 0.654, oC: 0.195, oH: 295.8, nL: 0.654, nC: 0.18, nH: 285 },
      { s: "20", o: "#8D62F4", n: "#7E6FEE", oL: 0.615, oC: 0.209, oH: 292.8, nL: 0.619, nC: 0.184, nH: 285 },
      { s: "30", o: "#8055F0", n: "#7463E6", oL: 0.581, oC: 0.22, oH: 290.6, nL: 0.585, nC: 0.191, nH: 284.7 },
      { s: "40", o: "#7147ED", n: "#6B56DD", oL: 0.546, oC: 0.234, oH: 287.6, nL: 0.55, nC: 0.197, nH: 285 },
      { s: "50", o: "#5F37E9", n: "#624AD3", oL: 0.507, oC: 0.246, oH: 283.6, nL: 0.515, nC: 0.2, nH: 284.9 },
      { s: "60", o: "#4E2CD7", n: "#593FC7", oL: 0.463, oC: 0.238, oH: 280.8, nL: 0.481, nC: 0.2, nH: 284.8 },
      { s: "70", o: "#4325C8", n: "#5035B9", oL: 0.432, oC: 0.229, oH: 279.2, nL: 0.447, nC: 0.195, nH: 284.7 },
      { s: "80", o: "#3B1EBA", n: "#482BAB", oL: 0.403, oC: 0.22, oH: 278.4, nL: 0.413, nC: 0.19, nH: 284.9 },
      { s: "90", o: "#3319AD", n: "#401F9E", oL: 0.378, oC: 0.211, oH: 277.2, nL: 0.378, nC: 0.187, nH: 285 },
    ],
  },
  water: {
    hue: "263.2",
    why:
      "Locked 263° azure. The deep blues had the highest chroma in the whole system (~0.25); eased to ~0.20 so they sit calmly on dark.",
    rows: [
      { s: "10", o: "#68A6FC", n: "#7BA7FF", oL: 0.721, oC: 0.142, oH: 256.8, nL: 0.734, nC: 0.137, nH: 263.2 },
      { s: "20", o: "#5C9BFA", n: "#6696FA", oL: 0.691, oC: 0.155, oH: 258.4, nL: 0.685, nC: 0.157, nH: 263.5 },
      { s: "30", o: "#508CF9", n: "#578AF4", oL: 0.654, oC: 0.174, oH: 261.3, nL: 0.649, nC: 0.168, nH: 263.2 },
      { s: "40", o: "#427EF7", n: "#4A7EEE", oL: 0.618, oC: 0.192, oH: 262.4, nL: 0.615, nC: 0.178, nH: 263.4 },
      { s: "50", o: "#3169F5", n: "#3C72E8", oL: 0.569, oC: 0.218, oH: 264.1, nL: 0.581, nC: 0.188, nH: 263.3 },
      { s: "60", o: "#2556ED", n: "#2F66E0", oL: 0.524, oC: 0.233, oH: 265, nL: 0.546, nC: 0.195, nH: 263.2 },
      { s: "70", o: "#1D49E6", n: "#235AD6", oL: 0.493, oC: 0.24, oH: 265.2, nL: 0.511, nC: 0.199, nH: 263.1 },
      { s: "80", o: "#153CE0", n: "#174ECC", oL: 0.465, oC: 0.247, oH: 265.2, nL: 0.476, nC: 0.203, nH: 263.1 },
      { s: "90", o: "#0D31D9", n: "#0B42C1", oL: 0.44, oC: 0.25, oH: 265, nL: 0.441, nC: 0.205, nH: 263.1 },
    ],
  },
  salt: {
    hue: "266.8",
    why:
      "Light neutral, used as primary/secondary text on dark. Unchanged from the uniformity pass — ultra-low chroma kept; secondary text holds 8.93 contrast on the dark canvas.",
    rows: [
      { s: "0", o: "#FFFFFF", n: "#FFFFFF", oL: 1, oC: 0, oH: 89.9, nL: 1, nC: 0, nH: 89.9 },
      { s: "10", o: "#F5F8FC", n: "#F5F6FA", oL: 0.978, oC: 0.006, oH: 255.5, nL: 0.974, nC: 0.005, nH: 275 },
      { s: "20", o: "#EDF0F7", n: "#EBEEF5", oL: 0.955, oC: 0.01, oH: 267.4, nL: 0.949, nC: 0.01, nH: 267.4 },
      { s: "30", o: "#E4E9F2", n: "#E1E5EF", oL: 0.933, oC: 0.013, oH: 262.4, nL: 0.922, nC: 0.014, nH: 268.5 },
      { s: "40", o: "#DBE1ED", n: "#D7DDE9", oL: 0.909, oC: 0.018, oH: 264.5, nL: 0.897, nC: 0.018, nH: 264.5 },
      { s: "50", o: "#CFD6E6", n: "#CDD4E4", oL: 0.876, oC: 0.023, oH: 266.9, nL: 0.869, nC: 0.023, nH: 266.9 },
      { s: "60", o: "#C2CADE", n: "#C3CCE0", oL: 0.839, oC: 0.029, oH: 268.3, nL: 0.844, nC: 0.03, nH: 266.3 },
      { s: "70", o: "#B9C2D9", n: "#BAC4DA", oL: 0.814, oC: 0.034, oH: 268.6, nL: 0.82, nC: 0.033, nH: 266.1 },
      { s: "80", o: "#B0BBD4", n: "#B1BBD5", oL: 0.792, oC: 0.038, oH: 266.6, nL: 0.793, nC: 0.039, nH: 268.8 },
      { s: "90", o: "#A8B3CF", n: "#A8B3CE", oL: 0.767, oC: 0.042, oH: 268.4, nL: 0.767, nC: 0.041, nH: 267.9 },
    ],
  },
  pepper: {
    hue: "266.4",
    why:
      "The dark surfaces themselves (page canvas, cards, sidebar). Rebuilt as a clean, evenly-spaced elevation ramp at a constant faint cool tint (C 0.015) so each raised surface is a deliberate step lighter — better depth perception in dark mode — while bg-default stays near-black (#0F1218, 18.75:1 with white text).",
    rows: [
      { s: "10", o: "#525866", n: "#545861", oL: 0.46, oC: 0.024, oH: 267, nL: 0.46, nC: 0.015, nH: 266.6 },
      { s: "20", o: "#494E5B", n: "#4B4E57", oL: 0.424, oC: 0.023, oH: 268.8, nL: 0.424, nC: 0.015, nH: 271 },
      { s: "30", o: "#404551", n: "#41454D", oL: 0.39, oC: 0.021, oH: 267.5, nL: 0.39, nC: 0.015, nH: 264.4 },
      { s: "40", o: "#383C47", n: "#383C44", oL: 0.357, oC: 0.02, oH: 269.6, nL: 0.355, nC: 0.015, nH: 264.4 },
      { s: "50", o: "#2D313A", n: "#2F333B", oL: 0.313, oC: 0.017, oH: 266.4, nL: 0.32, nC: 0.015, nH: 264.3 },
      { s: "60", o: "#22262D", n: "#272A32", oL: 0.268, oC: 0.014, oH: 261.7, nL: 0.285, nC: 0.015, nH: 269.1 },
      { s: "70", o: "#1C1F26", n: "#1E2229", oL: 0.239, oC: 0.014, oH: 267, nL: 0.251, nC: 0.015, nH: 261.7 },
      { s: "80", o: "#17191F", n: "#161921", oL: 0.214, oC: 0.012, oH: 270.8, nL: 0.214, nC: 0.016, nH: 268.9 },
      { s: "90", o: "#0E1217", n: "#0F1218", oL: 0.18, oC: 0.012, oH: 254.1, nL: 0.182, nC: 0.013, nH: 264.2 },
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
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, marginBottom: 6 }}>
            AFTER (OKLCH, dark-tuned)
          </div>
          <Ramp rows={fam.rows} which="n" />
        </div>
      </div>

      <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: 940 }}>
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
            const chromaCut = r.oC - r.nC;
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
                <td style={{ ...td, ...mono, color: chromaCut > 0.02 ? '#7BA7FF' : undefined }}>
                  {r.oC.toFixed(3)} → {r.nC.toFixed(3)}
                  {chromaCut > 0.02 ? `  (−${(chromaCut * 100).toFixed(0)}% buzz)` : ''}
                </td>
                <td style={{ ...td, ...mono, color: hueShift > 6 ? '#e0699b' : undefined }}>
                  {r.oH.toFixed(1)} → {r.nH.toFixed(1)}
                  {hueShift > 6 ? `  (−${hueShift.toFixed(0)}° drift)` : ''}
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
        OKLCH palette rebuild — tuned for dark mode
      </h1>
      <p style={{ opacity: 0.85 }}>
        The old ramps were authored in HSL/hand-tuned hex. Two problems compound across a 9-step
        ramp: the <strong>hue drifts</strong> as you go lighter/darker (so one &ldquo;family&rdquo;
        actually spans several hues), and the <strong>lightness steps are uneven</strong>.
        Rebuilding in <strong>OKLCH</strong> — a perceptually-uniform space where Lightness, Chroma
        and Hue are independent — fixes both, and then lets us tune specifically for{' '}
        <strong>dark mode, our primary theme</strong>.
      </p>

      <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 20 }}>Layer 1 — perceptual uniformity</h3>
      <ol style={{ opacity: 0.85, paddingLeft: 20 }}>
        <li>
          <strong>One locked hue per family</strong> (chroma-weighted average of the old ramp). The
          headline fix — e.g. <em>bun</em> swung 69°→35° across its ramp; it&rsquo;s now a single 47°
          orange, and <em>bacon</em> stops crossing the pink→red wrap.
        </li>
        <li>
          <strong>Evenly-spaced perceptual lightness</strong> between the family&rsquo;s existing
          endpoints — same visual range, equal increments.
        </li>
      </ol>

      <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 20 }}>Layer 2 — dark-mode tuning</h3>
      <ol style={{ opacity: 0.85, paddingLeft: 20 }}>
        <li>
          <strong>Chroma soft-cap.</strong> Highly saturated colors visibly vibrate/halate against
          near-black and cause eye-strain. Chroma above a ~0.16 knee is compressed by half, so the
          buzziest families calm down (<em>cabbage</em> ~0.27→0.21, <em>water</em> ~0.25→0.20) while
          already-muted families (<em>burger</em>, <em>blueCheese</em>) are untouched.
        </li>
        <li>
          <strong>Light-tint lift.</strong> The lightest foreground tints are nudged toward white so
          accents-as-text/icons read crisply on dark. The solid mid-fill steps are left alone, so
          white-on-button contrast is preserved.
        </li>
        <li>
          <strong>Neutral elevation.</strong> <em>pepper</em> (the dark surfaces) is rebuilt as a
          clean, evenly-spaced ramp at a constant faint cool tint — each raised surface is a
          deliberate step lighter, improving depth perception in dark mode while the page canvas
          stays near-black.
        </li>
      </ol>

      <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 20 }}>Contrast — validated on the dark canvas</h3>
      <ul style={{ opacity: 0.85, paddingLeft: 20, ...mono, fontSize: 12 }}>
        <li>White text on bg-default (#0F1218): <strong>18.75:1</strong></li>
        <li>Secondary text (salt.90) on bg-default: <strong>8.93:1</strong></li>
        <li>Accent text (cabbage.10) on bg-default: <strong>7.47:1</strong> (AAA)</li>
        <li>White on brand button (cabbage.40): <strong>3.81:1</strong> (was 3.76 — no regression)</li>
      </ul>

      <p style={{ opacity: 0.85, marginTop: 16 }}>
        Token names, shade levels, semantic mapping and overlay opacity percentages are unchanged —
        only the underlying hex values move, so everything cascades automatically through
        <code> --theme-* </code> in base.css. See the <strong>Comparison</strong> story for the full
        old-vs-new table per family.
      </p>
      <p style={{ fontSize: 12, opacity: 0.6, marginTop: 16 }}>
        References: OKLCH color model (oklch.fyi, jakub.kr, evilmartians, LogRocket); dark-theme color
        guidance (Material Design dark theme, Radix Colors 12-step scale); interfaces.dev craft
        principles.
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
        Hue shifts &gt; 6° (drift removed) and chroma cuts &gt; 0.02 (dark-mode de-buzzing) are
        highlighted. Lightness and chroma are in OKLCH units (L 0–1, C 0–0.4).
      </p>
      {FAMILY_ORDER.map((name) => (
        <FamilyBlock key={name} name={name} />
      ))}
    </div>
  ),
};
