export const SNAPSHOT_SIZE = 1080;

/* eslint-disable no-bitwise -- an FNV hash and a mulberry32 PRNG are defined
   in terms of integer bit operations; expressing them any other way would
   change the numbers they produce. */
const hashSeed = (seed: string): number => {
  let hash = 2166136261;

  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const createRandom = (seed: string): (() => number) => {
  let state = hashSeed(seed) || 1;

  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
/* eslint-enable no-bitwise */

/**
 * Sampled from the App Store screenshots: a near-black violet ground with one
 * large halo behind the subject and a quieter wash along the bottom.
 */
const BASE = 'linear-gradient(178deg, #150C26 0%, #0B0713 52%, #08060F 100%)';

const HALOS = [
  { r: 128, g: 82, b: 214 },
  { r: 151, g: 78, b: 224 },
  { r: 106, g: 78, b: 220 },
  { r: 177, g: 75, b: 215 },
];

const rgba = (
  { r, g, b }: { r: number; g: number; b: number },
  alpha: number,
): string => `rgba(${r}, ${g}, ${b}, ${alpha})`;

export function getSnapshotGradient(seed: string): string {
  const random = createRandom(seed);
  const halo = HALOS[Math.floor(random() * HALOS.length)];
  const accent = HALOS[Math.floor(random() * HALOS.length)];

  const haloX = Math.round(38 + random() * 24);
  const haloY = Math.round(2 + random() * 12);
  const haloAlpha = 0.5 + random() * 0.18;

  const washX = Math.round(12 + random() * 76);
  const washAlpha = 0.16 + random() * 0.12;

  return [
    `radial-gradient(72% 48% at ${haloX}% ${haloY}%, ${rgba(
      halo,
      haloAlpha,
    )} 0%, ${rgba(halo, 0)} 68%)`,
    `radial-gradient(58% 34% at ${washX}% 104%, ${rgba(
      accent,
      washAlpha,
    )} 0%, ${rgba(accent, 0)} 72%)`,
    BASE,
  ].join(', ');
}
