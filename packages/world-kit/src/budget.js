/**
 * What the reading buys, and the only thing an author gets to spend.
 *
 * The rule the whole authoring layer rests on: the reader's level decides HOW
 * MUCH, the author decides WHAT SHAPE. Envelope, detail and glow are all derived
 * from the district's live level every time it is drawn, exactly like the tier
 * itself, so nothing an author writes can make a world look better-read than it
 * is. An object that busts its envelope is not rejected, it is FITTED into it —
 * the cheat renders as a shrunken blob rather than a big building, which removes
 * the incentive instead of policing it.
 *
 * The numbers below are provisional. The calibration pass measures the stock
 * builders at every level and sets these from the art itself, so an authored
 * object can never be richer than what the generator would have drawn in the
 * same slot. Until that lands these are hand-set and deliberately tight.
 */

import { FAMILY_KINDS } from './vocabulary.js';

/** Level at which each family reaches tier 1, 2 and 3. Mirrors the prototype's catalogue. */
const TIER_AT = {
  house: [2, 7, 12],
  tower: [6, 9, 12],
  hall: [6, 10, 12],
  garden: [4, 9, 12],
  plant: [1, 6, 11],
  lamp: [3, 8, 12],
  feature: [5, 10, 12],
  landmark: [1, 6, 11],
  monument: [3, 7, 11],
};

/** [width, height, depth] the object is fitted into, per family per tier. */
const ENVELOPE = {
  house: [[1.8, 1.8, 1.8], [2.2, 2.6, 2.2], [2.6, 3.4, 2.6]],
  tower: [[2.2, 6.0, 2.2], [2.6, 7.2, 2.6], [3.0, 9.0, 3.0]],
  hall: [[3.4, 2.4, 3.4], [4.0, 3.0, 4.0], [4.6, 3.6, 4.6]],
  garden: [[1.2, 0.5, 1.2], [1.6, 0.8, 1.6], [2.0, 1.1, 2.0]],
  plant: [[1.2, 1.8, 1.2], [1.6, 2.6, 1.6], [2.0, 3.4, 2.0]],
  lamp: [[0.7, 1.6, 0.7], [0.8, 2.0, 0.8], [0.9, 2.4, 0.9]],
  feature: [[1.6, 1.0, 1.6], [2.0, 1.4, 2.0], [2.4, 1.8, 2.4]],
  landmark: [[3.2, 3.2, 3.2], [7.0, 8.0, 7.0], [12.0, 14.0, 12.0]],
  monument: [[3.6, 4.0, 3.6], [5.0, 7.0, 5.0], [6.8, 10.0, 6.8]],
};

const TIER_OPS = [40, 90, 160];
const TIER_TRIS = [900, 2200, 4000];
const TIER_GLOW = [1.0, 2.0, 3.2];

/* Detail scales with how much of the district an object occupies: a lamp that
   may spend a hall's triangle budget is a lamp nobody can see past. Glow runs on
   its own weights because a lamp is SUPPOSED to be the bright thing. */
const DETAIL_W = {
  house: 1,
  tower: 1.4,
  hall: 1.4,
  garden: 0.5,
  plant: 0.6,
  lamp: 0.35,
  feature: 0.7,
  landmark: 4,
  monument: 2.5,
};
const GLOW_W = {
  house: 1,
  tower: 1.2,
  hall: 1,
  garden: 0.6,
  plant: 0.6,
  lamp: 3,
  feature: 1.5,
  landmark: 2,
  monument: 2,
};

export const clampLevel = (level) => Math.max(1, Math.min(12, Math.round(level || 1)));

/** Which tier a family stands at for a district on a given rung. 0 means not unlocked yet. */
export function tierOf(family, level) {
  const at = TIER_AT[family];
  if (!at) return 0;
  const l = clampLevel(level);
  if (l >= at[2]) return 3;
  if (l >= at[1]) return 2;
  if (l >= at[0]) return 1;
  return 0;
}

/** The representative rung used to record each of a realm builder's three tiers. */
export const tierLevelsOf = (family) => [...(TIER_AT[family] ?? [])];

export const unlockedFamilies = (level) =>
  FAMILY_KINDS.filter((family) => tierOf(family, level) > 0);

/** The full spend allowance for one authored object. */
export function budgetOf(family, level) {
  const tier = tierOf(family, level);
  if (!tier) return null;
  const i = tier - 1;
  return {
    family,
    level: clampLevel(level),
    tier,
    envelope: ENVELOPE[family][i],
    maxOps: Math.round(TIER_OPS[i] * DETAIL_W[family]),
    maxTriangles: Math.round(TIER_TRIS[i] * DETAIL_W[family]),
    maxGlow: Number((TIER_GLOW[i] * GLOW_W[family]).toFixed(2)),
    unlocksAt: TIER_AT[family],
  };
}
