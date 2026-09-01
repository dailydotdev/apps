/**
 * Types for the authoring API.
 *
 * Hand-written rather than inferred: the recorder builds its shape methods from
 * the `GEOM` table at runtime, so there is no value for `typeof` to read. This
 * file is the one place the vocabulary is stated twice, and the recorder's own
 * argument validation is what actually enforces it.
 */

export type ObjectFamily =
  | 'house'
  | 'tower'
  | 'hall'
  | 'garden'
  | 'plant'
  | 'lamp'
  | 'feature'
  | 'landmark'
  | 'monument';

export type RealmId =
  | 'swarm' | 'frame' | 'forge' | 'ship' | 'bastion' | 'quarter';

export interface MaterialOptions {
  /** 0 is a mirror, 1 is chalk. */
  rough?: number;
  /** Flat shading, which is the world's default look. */
  flat?: boolean;
}

/** A recorded shape. Every setter returns the shape, so one object is one chain. */
export interface Shape {
  mat: (name: string, opts?: MaterialOptions) => Shape;
  glow: (name: string, intensity?: number) => Shape;
  at: (x?: number, y?: number, z?: number) => Shape;
  rot: (x?: number, y?: number, z?: number) => Shape;
  scale: (x?: number, y?: number, z?: number) => Shape;
}

/** What a builder is handed. */
export interface Recorder {
  box: (w: number, h: number, d: number) => Shape;
  cyl: (rTop: number, rBottom: number, h: number, seg?: number) => Shape;
  sphere: (r: number, widthSeg?: number, heightSeg?: number) => Shape;
  cone: (r: number, h: number, seg?: number) => Shape;
  torus: (r: number, tube: number, radialSeg?: number, tubularSeg?: number) => Shape;
  octa: (r: number) => Shape;
  plane: (w: number, h: number) => Shape;

  /** The legal colour names for this district, as a lookup of name to name. */
  P: Readonly<Record<string, string>>;
  palette: string[];
  realm: RealmId;
  /** Present for an explicit district override; realm builders receive null. */
  niche: string | null;
  family: ObjectFamily;
  /** The district's rung, 1 to 12. */
  level: number;
  /** 1, 2 or 3. What this family has grown into at that rung. */
  tier: number;
  /**
   * Which recorded variant this run is, and how many exist.
   *
   * Branch SHAPE on this, not on `rnd()`. The renderer picks a variant per
   * instance from the district's own seed, so `w.variant % 3` gives three
   * archetypes spread evenly by construction, where three draws from `rnd()`
   * may land on the same one. For a family a district stands only once —
   * `landmark`, `monument` — this is what makes one district's centrepiece a
   * different building from its neighbour's.
   */
  variant: number;
  variants: number;
  /** The only randomness a builder may use. Seeded per variant. */
  rnd: () => number;
  lerp: (a: number, b: number, t: number) => number;
  TAU: number;
}

export type Builder = (w: Recorder) => void;

export interface Budget {
  family: ObjectFamily;
  level: number;
  tier: number;
  envelope: [number, number, number];
  maxOps: number;
  maxTriangles: number;
  maxGlow: number;
  unlocksAt: [number, number, number];
}

export interface BuildReport {
  ok: boolean;
  opsVersion: number;
  /** FNV-1a of the source, so a report is never read against a stale file. */
  sourceHash: string;
  realm: RealmId;
  niche: string | null;
  family: ObjectFamily;
  level: number | null;
  tier?: number;
  errors: string[];
  warnings: string[];
  budget?: Budget;
  usage?: { ops: string; triangles: string; glow: string };
  geometry?: {
    size: [number, number, number];
    /** Lowest point after fitting. Should be 0. */
    base: number;
    /** How much the object was shrunk to fit its envelope. Never above 1. */
    fit: number;
    envelope: [number, number, number];
  };
  /** One recorded op list per seed, so a district is not full of clones. */
  variants?: Array<{ ops: unknown[]; size: [number, number, number] }>;
}

export function runBuilder(
  build: Builder,
  ctx: {
    realm: RealmId | string;
    niche: string | null;
    family: ObjectFamily | string;
    level: number;
    source?: string;
  },
): BuildReport;

export function runRealmBuilder(
  build: Builder,
  ctx: {
    realm: RealmId | string;
    family: ObjectFamily | string;
    source?: string;
  },
): BuildReport & {
  scope: 'realm';
  tiers?: Record<number, Array<{ ops: unknown[]; size: [number, number, number] }>>;
};

export function budgetOf(family: string, level: number): Budget | null;
export function tierOf(family: string, level: number): number;
export function tierLevelsOf(family: string): number[];
export function unlockedFamilies(level: number): ObjectFamily[];
export function clampLevel(level: number): number;
export function paletteKeys(realm: string): string[];
export function rolesOf(realm: string): {
  wall: string; wall2: string; roof: string; trim: string;
};
export function realmOf(niche: string): RealmId | null;
export function hashSource(source: string): string;

export const REALM_OF: Record<string, RealmId>;
export const REALMS: RealmId[];
export const FAMILY_KINDS: ObjectFamily[];
export const FAMILIES: Record<
  ObjectFamily,
  { name: string; hint: string; footprint: number }
>;
export const GEOM_KINDS: string[];
export const VARIANTS: number;
export const OPS_VERSION: number;
