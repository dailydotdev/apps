/**
 * Running a builder: the same code path in node and in the browser Worker.
 *
 * Two things happen here that are easy to miss the point of.
 *
 * K SEEDED VARIANTS. A builder replaces a family across a whole district, and a
 * district can stand twelve of them. Recording one op list would give twelve
 * identical clones, which is the first thing anybody notices. So the source is
 * run once per seed and the renderer picks a variant per instance, exactly as
 * the generated builders vary through their own `rnd`.
 *
 * DETERMINISM BY EXECUTION. An author reaching for `Math.random` gets a builder
 * that renders differently every time it is replayed, which is a bug nobody can
 * see coming. Rather than lint the source for it, every seed is run twice and
 * the op lists are compared. That catches the date, the counter and the global
 * as well, and it cannot be talked around.
 */

import { createRecorder, measure } from './record.js';
import { tierLevelsOf, tierOf } from './budget.js';
import { validate } from './validate.js';
import { OPS_VERSION, VARIANTS } from './vocabulary.js';

/** FNV-1a. Small, synchronous and identical in both hosts, which crypto is not. */
export function hashSource(source) {
  let h = 0x811c9dc5;
  for (let i = 0; i < source.length; i += 1) {
    h ^= source.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

const record = (build, ctx, seed) => {
  const { api, ops } = createRecorder({ ...ctx, seed });
  build(api);
  return ops;
};

/**
 * The seed for variant `i`, mixed rather than counted.
 *
 * This used to be `1000 + i * 7919`, and an arithmetic progression is close to
 * the worst thing you can hand a xorshift: its first output barely moves across
 * neighbouring seeds. Variants 0 and 2 opened on 0.0620 and 0.0592, variants 1
 * and 3 on 0.5586 and 0.5578 — so an author who branched a shape on their FIRST
 * `rnd()` call, which is the obvious place to choose between forms, silently
 * got two or three distinct variants out of five. Every district then drew from
 * that collapsed set, which is exactly the "twelve identical clones" this file
 * exists to prevent.
 *
 * Mixing the index first (a 32-bit avalanche) gives every variant an
 * independent start, so the first draw is as usable as any later one.
 */
const seedOf = (i) => {
  let h = Math.imul(i + 1, 0x9e3779b1) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h || 1;
};

/**
 * @param build   the author's default export
 * @param ctx     { realm, niche, family, level, source }
 * @returns       { ok, errors, warnings, budget, usage, geometry, variants, sourceHash }
 */
export function runBuilder(build, ctx) {
  const { realm, niche, family, level, source = '' } = ctx;
  const sourceHash = hashSource(source);
  const base = { opsVersion: OPS_VERSION, sourceHash, realm, niche, family, level };

  if (typeof build !== 'function') {
    return {
      ...base,
      ok: false,
      errors: ['No builder found. The file must `export default function build(w) { ... }`.'],
      warnings: [],
    };
  }

  const tier = tierOf(family, level);
  const variants = [];
  for (let i = 0; i < VARIANTS; i += 1) {
    const seed = seedOf(i);
    let ops;
    const vctx = { realm, niche, family, level, tier, variant: i, variants: VARIANTS };
    try {
      ops = record(build, vctx, seed);
    } catch (error) {
      return {
        ...base,
        ok: false,
        errors: [`${error.message}${error.line ? ` (line ${error.line})` : ''}`],
        warnings: [],
        stack: error.stack,
      };
    }
    /* Every variant runs twice, not just the first: nondeterminism that hides
       behind a `w.variant` branch would otherwise validate cleanly and then
       hash differently on every recompile of identical source. */
    const again = record(build, vctx, seed);
    if (JSON.stringify(again) !== JSON.stringify(ops)) {
      return {
        ...base,
        ok: false,
        errors: [
          `The builder is not deterministic on variant ${i}: two runs with the same seed produced different shapes. Use the \`rnd()\` passed in, never Math.random, Date or a value from outside the function.`,
        ],
        warnings: [],
      };
    }
    /* The recorded EXTENT travels with the ops. The renderer has to fit each
       variant into the district's envelope and it must not have to re-measure
       geometry it has not built yet, so the measurement made here is the one it
       scales by. */
    variants.push({ ops, size: measure(ops).size.map((n) => Number(n.toFixed(4))) });
  }

  /* Validated on variant 0 and enforced on all of them: a builder that stays in
     budget on one seed and blows it on another is a builder that would pass here
     and fail on somebody's district. */
  const result = validate({ ops: variants[0].ops, realm, family, level });
  for (let i = 1; i < variants.length && result.ok; i += 1) {
    const other = validate({ ops: variants[i].ops, realm, family, level });
    if (!other.ok) {
      result.ok = false;
      result.errors = other.errors.map((e) => `on variant ${i}: ${e}`);
    }
  }

  return { ...base, ...result, tier, variants };
}

/**
 * Compile one realm-family source for every level tier it can stand at.
 *
 * The source is authored once. The renderer chooses a tier for the destination
 * district or realm island, so the same object set drives both views without a
 * second build mode or district-specific source files.
 */
export function runRealmBuilder(build, ctx) {
  const { realm, family, source = '' } = ctx;
  const sourceHash = hashSource(source);
  const reports = tierLevelsOf(family).map((level) =>
    runBuilder(build, {
      realm,
      niche: null,
      family,
      level,
      source,
    }),
  );
  const failed = reports.find((report) => !report.ok);
  const latest = reports[reports.length - 1];

  if (failed) {
    return {
      ...failed,
      sourceHash,
      scope: 'realm',
      errors: failed.errors.map((error) =>
        failed.tier ? `tier ${failed.tier}: ${error}` : error,
      ),
    };
  }

  return {
    ...latest,
    scope: 'realm',
    sourceHash,
    level: null,
    tiers: Object.fromEntries(
      reports.map((report) => [report.tier, report.variants]),
    ),
    warnings: reports.flatMap((report) =>
      report.warnings.map((warning) => `tier ${report.tier}: ${warning}`),
    ),
  };
}
