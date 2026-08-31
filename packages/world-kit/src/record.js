/**
 * The recording proxy: the API an author writes against.
 *
 * Nothing here builds geometry. Every call appends a flat op, and the op list is
 * the only thing that ever leaves the author's machine. The renderer replays it
 * with its own materials and its own helpers, so a visitor never executes a line
 * of anyone else's code.
 *
 * Triangle counts and extents are closed-form per primitive rather than measured
 * off real geometry, which is what keeps this file free of a three.js dependency
 * and lets `check` run anywhere node runs.
 */

import { GEOM, GEOM_KINDS, MAT_OPTS, paletteKeys } from './vocabulary.js';

const TAU = Math.PI * 2;

/** The engine's own hash-seeded generator, so a variant seeded here matches one seeded there. */
export function rngOf(seed) {
  let s = (seed >>> 0) || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

const TRIS = {
  box: () => 12,
  cyl: (a) => {
    const seg = a[3];
    return seg * 2 + (a[0] > 0 ? seg : 0) + (a[1] > 0 ? seg : 0);
  },
  sphere: (a) => 2 * a[1] * (a[2] - 1),
  cone: (a) => a[2] * 2,
  torus: (a) => a[2] * a[3] * 2,
  octa: () => 8,
  plane: () => 2,
};

/** Half-extents of the primitive in its own space, all of which three centres on the origin. */
const HALF = {
  box: (a) => [a[0] / 2, a[1] / 2, a[2] / 2],
  cyl: (a) => {
    const r = Math.max(a[0], a[1]);
    return [r, a[2] / 2, r];
  },
  sphere: (a) => [a[0], a[0], a[0]],
  cone: (a) => [a[0], a[1] / 2, a[0]],
  torus: (a) => [a[0] + a[1], a[0] + a[1], a[1]],
  octa: (a) => [a[0], a[0], a[0]],
  plane: (a) => [a[0] / 2, a[1] / 2, 0],
};

/** Surface area, used only to price glow. */
const AREA = {
  box: (a) => 2 * (a[0] * a[1] + a[0] * a[2] + a[1] * a[2]),
  cyl: (a) => {
    const rt = a[0];
    const rb = a[1];
    const h = a[2];
    const slant = Math.hypot(h, rb - rt);
    return Math.PI * (rt + rb) * slant + Math.PI * (rt * rt + rb * rb);
  },
  sphere: (a) => 4 * Math.PI * a[0] * a[0],
  cone: (a) => Math.PI * a[0] * (a[0] + Math.hypot(a[0], a[1])),
  torus: (a) => TAU * a[0] * TAU * a[1],
  octa: (a) => 4 * Math.sqrt(3) * a[0] * a[0],
  plane: (a) => a[0] * a[1],
};

const isNum = (n) => typeof n === 'number' && Number.isFinite(n);

class Fail extends Error {
  constructor(message, op) {
    super(message);
    this.op = op;
  }
}

/**
 * One recorded shape. Every setter returns `this`, so a builder reads as one
 * chain per object and the argument order of a primitive is the only positional
 * thing an author has to remember.
 */
class Shape {
  constructor(op) {
    this.op = op;
  }

  mat(name, opts = {}) {
    this.op.m = name;
    for (const [k, v] of Object.entries(opts)) this.op.o[k] = v;
    return this;
  }

  glow(name, intensity = 1.4) {
    this.op.m = name;
    this.op.o.glow = intensity;
    return this;
  }

  at(x = 0, y = 0, z = 0) {
    this.op.p = [x, y, z];
    return this;
  }

  rot(x = 0, y = 0, z = 0) {
    this.op.r = [x, y, z];
    return this;
  }

  scale(x = 1, y = x, z = x) {
    this.op.s = [x, y, z];
    return this;
  }
}

/**
 * Build the object handed to a builder function.
 *
 * `P` is deliberately NOT the real palette: an author gets the legal colour
 * NAMES for their realm and nothing else, because a builder that can read a hex
 * value is a builder that can write one, and then the district stops being able
 * to recolour what stands in it.
 */
export function createRecorder({ realm, niche, family, level, tier, seed, variant = 0, variants = 1 }) {
  const ops = [];
  const keys = paletteKeys(realm);
  const palette = Object.freeze(Object.fromEntries(keys.map((k) => [k, k])));

  const add = (kind, args) => {
    const spec = GEOM[kind];
    const a = spec.args.map(([name, min, max, dflt], i) => {
      const raw = args[i] ?? dflt;
      if (!isNum(raw)) {
        throw new Fail(`${kind}(): argument "${name}" must be a finite number, got ${JSON.stringify(raw)}`, ops.length);
      }
      if (raw < min || raw > max) {
        throw new Fail(`${kind}(): argument "${name}" is ${raw}, outside the allowed ${min} to ${max}`, ops.length);
      }
      return spec.args[i][3] !== undefined ? Math.round(raw) : raw;
    });
    const op = { g: kind, a, m: 'stone', o: {}, p: [0, 0, 0], r: [0, 0, 0], s: [1, 1, 1] };
    ops.push(op);
    return new Shape(op);
  };

  const api = {
    P: palette,
    palette: keys,
    realm,
    niche,
    family,
    level,
    tier,
    /* Which of the recorded variants this run is, and how many there are.
       This is the ONLY spread an author can rely on. Five draws from `rnd()`
       will cluster by chance however well the generator is seeded — two of five
       landing within 0.005 of each other is ordinary luck, not a bug — and an
       archetype chosen that way silently collapses variants onto one form. An
       index divides evenly by construction: `w.variant % 3` is three forms,
       always. Branch shape on this, and spend `rnd()` on proportion. */
    variant,
    variants,
    rnd: rngOf(seed),
    lerp: (a, b, t) => a + (b - a) * t,
    TAU,
  };
  for (const kind of GEOM_KINDS) api[kind] = (...args) => add(kind, args);

  return { api, ops };
}

/** Everything the validator needs that only the recorder can know. */
export function measure(ops) {
  let triangles = 0;
  let glow = 0;
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  ops.forEach((op, i) => {
    triangles += TRIS[op.g](op.a);

    const [hx, hy, hz] = HALF[op.g](op.a);
    const [sx, sy, sz] = op.s;
    const [rx, ry, rz] = op.r;
    const cos = [Math.cos(rx), Math.cos(ry), Math.cos(rz)];
    const sin = [Math.sin(rx), Math.sin(ry), Math.sin(rz)];

    for (let c = 0; c < 8; c += 1) {
      let x = (c & 1 ? hx : -hx) * sx;
      let y = (c & 2 ? hy : -hy) * sy;
      let z = (c & 4 ? hz : -hz) * sz;
      // Euler XYZ, matching three's default rotation order.
      let t = y * cos[0] - z * sin[0];
      z = y * sin[0] + z * cos[0];
      y = t;
      t = x * cos[1] + z * sin[1];
      z = -x * sin[1] + z * cos[1];
      x = t;
      t = x * cos[2] - y * sin[2];
      y = x * sin[2] + y * cos[2];
      x = t;
      const p = [x + op.p[0], y + op.p[1], z + op.p[2]];
      for (let d = 0; d < 3; d += 1) {
        if (p[d] < min[d]) min[d] = p[d];
        if (p[d] > max[d]) max[d] = p[d];
      }
    }

    if (op.o.glow > 0) {
      const s = Math.cbrt(Math.abs(sx * sy * sz)) || 1;
      glow += AREA[op.g](op.a) * s * s * op.o.glow;
    }
  });

  if (!ops.length) return { triangles: 0, glow: 0, min: [0, 0, 0], max: [0, 0, 0], size: [0, 0, 0] };
  return { triangles, glow, min, max, size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]] };
}

export { Fail, MAT_OPTS };
