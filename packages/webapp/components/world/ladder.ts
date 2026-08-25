/**
 * The twelve-step ladder, and everything derived from a district's position on
 * it.
 *
 * Split out of `engine/taxonomy.js` rather than left there because taxonomy
 * imports `three` on its first line. Anything outside the world page that wants
 * to say how far a district is from its next rung (a feed nudge, a post-read
 * card) would drag most of a megabyte of renderer in behind one integer
 * comparison. Nothing here knows what a district looks like, so nothing here
 * needs the renderer.
 *
 * `taxonomy.js` re-exports `LEVELS` and `levelOf` so the engine still has one
 * source of truth for the rungs.
 */

export interface WorldLevel {
  /** Lifetime article count at which this rung is reached. */
  reads: number;
  /** What this rung is supposed to BUILD. */
  d: string;
}

/* Twelve rungs, doubling from L4 up: one rung per doubling of attention. That
   is scale-free, so it spreads any world's districts the same way wherever that
   world sits, which is the property that matters here — you look at one world
   at a time, and the job is to separate ONE reader's districts from each other.

   Tuning instead for an even spread across everybody drags every rung down,
   because the population is dominated by districts holding a single article.
   What comes out is a world where everything is the same size, which is exactly
   the saturation this ladder exists to prevent.

   Two limits worth knowing. The bottom and the top compete: every rung spent
   separating one article from two is a rung not available to a long-time
   reader. And nothing can split the districts holding exactly one article, so
   L1 is a floor we accept rather than a rung anybody earns.

   L12 stays out of reach on purpose. A ladder whose ceiling is reachable stops
   being a ceiling.

   The rungs are numbered and nothing else. `reads` is the only field that ever
   reaches a reader, as "L7"; the descriptions are for whoever edits the
   geometry, and say what each rung is supposed to BUILD next to the threshold
   that triggers it. */
export const LEVELS: WorldLevel[] = [
  {
    reads: 1,
    d: 'A single lodestone on bare rock. One article is a real thing that happened — it gets land, however little.',
  },
  {
    reads: 2,
    d: 'Somebody stacked stones and planted the first crystal sprout. Still wild, no longer untouched.',
  },
  {
    reads: 3,
    d: "A tended camp: lantern, path, the district's signature motif appears — identity arrives early, before size does.",
  },
  {
    reads: 5,
    d: 'Ground is cut into two terraces and the first roof goes up. The plot starts reading as built, not found.',
  },
  {
    reads: 10,
    d: 'A working hamlet with a pool at its heart. Gardens, hedges, the first real greenery.',
  },
  {
    reads: 20,
    d: 'Three terraces, a dome, and the first spire. Birds arrive — the place is worth circling.',
  },
  {
    reads: 40,
    d: 'Water spills off the rim as a falls. Lamps line the paths. Density picks up faster than the land does.',
  },
  {
    reads: 80,
    d: 'Ground runs out before the reading does: cantilever decks brace out past the cliff on struts. The silhouette stops being a lump.',
  },
  {
    reads: 160,
    d: 'Four terraces, a spire cluster, and sky bridges strung between the towers. Legible from across the map.',
  },
  {
    reads: 320,
    d: 'Lanterns and hanging gardens spill over the terrace lips, a second hall opens, and the district starts growing downward as well as out.',
  },
  {
    reads: 640,
    d: 'The Great Spire goes up — one landmark that owns the skyline — over a full upper tier of decks and bridges.',
  },
  {
    reads: 1280,
    d: 'The endgame plot. Everything lit, everything tended, everything moving. A capital of one subject.',
  },
];

export const MAX_LEVEL = LEVELS.length;

/**
 * Level from a lifetime article count, on the twelve-step ladder.
 *
 * The engine calls this once per district per day of history, so it stays a
 * plain scan over twelve entries rather than anything that allocates.
 */
export function levelOf(articles: number): number {
  if (articles <= 0) {
    return 0;
  }
  let level = 1;
  for (let i = 0; i < LEVELS.length; i += 1) {
    if (articles >= LEVELS[i].reads) {
      level = i + 1;
    }
  }
  return level;
}

/** The minimum a district needs to sit on `level`, and 0 for untouched ground. */
export const floorOf = (level: number): number =>
  level <= 0 ? 0 : LEVELS[level - 1].reads;

/* A REALM is scored on the same ladder with its thresholds moved out, because a
   realm collects many districts and would otherwise top out long before the
   districts inside it do. A divisor too small saturates the top of the range,
   which is the same flattening the twelve-step ladder exists to prevent, one
   scale up.

   No divisor rescues the middle of this axis, and it is honest to say so: a
   reader covers a handful of niches inside one or two realms, so most realms
   sit on the first rung whatever we pick. This ladder separates the top of the
   range; it is not a progress bar for the median. Floored at 1: a realm you
   have read once is small, not absent. */
export const REALM_DIV = 8;

export const realmLevelOf = (articles: number): number =>
  articles <= 0 ? 0 : Math.max(1, levelOf(articles / REALM_DIV));

export interface LevelProgress {
  level: number;
  /** Articles still to read for the next rung. 0 once the ladder is topped out. */
  toNext: number;
  /** 0 to 1 across the current rung. 1 at L12, which has nothing above it. */
  fraction: number;
  /** Null at L12. */
  next?: WorldLevel;
}

/**
 * Where a district stands between the rung it is on and the one above it.
 *
 * `div` scales the whole ladder for things scored on a stretched copy of it:
 * pass `REALM_DIV` for a realm, nothing for a district. It is the divisor rather
 * than pre-divided reads because every number that comes back out is in
 * ARTICLES, and "read 28 more" has to be a count of articles a reader can go and
 * read, not a count of eighths.
 *
 * The rungs double, so `fraction` is a within-rung position and NOT comparable
 * between districts: half way from L11 to L12 is 320 articles, half way from L1
 * to L2 is not quite one. Anything that ranks districts against each other has
 * to rank on `toNext`.
 */
export const levelProgress = (reads: number, div = 1): LevelProgress => {
  const level = div === 1 ? levelOf(reads) : realmLevelOf(reads);
  if (level >= MAX_LEVEL) {
    return { level, toNext: 0, fraction: 1 };
  }

  const ceiling = LEVELS[level].reads * div;
  /* `realmLevelOf` floors at L1, so a realm sitting on its first rung can hold
     fewer articles than that rung's own threshold. Clamping the floor to what
     has actually been read keeps such a realm at the START of the bar instead
     of behind it. A district cannot reach L1 below the threshold, so this is
     the identity for everything else. */
  const floor = Math.min(floorOf(level) * div, reads);

  return {
    level,
    /* Ceiled: the ladder is walked in whole articles, and a realm 0.4 of an
       article short still needs one more read to cross. */
    toNext: Math.ceil(ceiling - reads),
    fraction: (reads - floor) / (ceiling - floor),
    next: LEVELS[level],
  };
};

/** The least a district has to carry to be worth pointing at. */
export interface LadderRow {
  key: string;
  name: string;
  reads: number;
}

export interface NearestLevelUp extends LevelProgress {
  key: string;
  name: string;
  reads: number;
  /** Present, so callers never have to re-test `level >= MAX_LEVEL`. */
  next: WorldLevel;
}

/**
 * The district closest to its next rung, anywhere in the world.
 *
 * This is the whole mechanic, and picking the nearest rather than the biggest is
 * what makes it usable. The ladder doubles, so a reader's strongest district is
 * usually their FURTHEST from levelling: a district at L11 needs 640 more
 * articles, and putting that number in front of someone is a reason to stop, not
 * to read. Their seventh district is typically one or two away.
 *
 * It also means the target moves as they read, which is the only variability in
 * the mechanic that we do not have to invent.
 *
 * Ties break towards the district with more reads: of two districts one article
 * from a rung, the one further along is the one they are actually reading.
 */
export const nearestLevelUp = (
  rows: readonly LadderRow[] | undefined,
): NearestLevelUp | null => {
  if (!rows?.length) {
    return null;
  }

  let best: NearestLevelUp | null = null;
  rows.forEach((row) => {
    const progress = levelProgress(row.reads);
    // Topped out: there is no next rung to walk towards.
    if (!progress.next) {
      return;
    }
    if (
      best &&
      (progress.toNext > best.toNext ||
        (progress.toNext === best.toNext && row.reads <= best.reads))
    ) {
      return;
    }
    best = { ...row, ...progress, next: progress.next };
  });

  return best;
};
