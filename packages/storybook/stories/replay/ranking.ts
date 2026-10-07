import {
  differenceInCalendarDays,
  format,
  getISOWeek,
  getISOWeekYear,
  startOfISOWeek,
  subDays,
  subWeeks,
} from 'date-fns';
import type { Candidate } from './catalog';
import {
  Category,
  catalog,
  handoffFrame,
  Mode,
  Shareability,
  Tier,
} from './catalog';

// The Replay engine: when a recap is delivered, what window it covers, and
// which candidates win the seats. The stories run this, so what you see in
// Storybook is the behaviour, not a description of it.

/* -------------------------------------------------------------------------- */
/* Delivery                                                                    */
/* -------------------------------------------------------------------------- */

export const CATCH_UP_AFTER_DAYS = 7;
export const CATCH_UP_MAX_DAYS = 28;
/**
 * Five highlights, not eight.
 *
 * Spotify's 2025 Wrapped surfaces "up to five remarkable days" per listener,
 * and that is the right ceiling for a weekly cadence too: nine cards a week is
 * a report someone learns to close. The two bookends are structural rather
 * than earned, so the whole thing is five to seven taps.
 */
export const WEEKLY_CAP = 5;
export const ANNUAL_CAP = 10;

/** The key everything is deduped against. One recap per person per ISO week. */
export const weekKey = (date: Date): string =>
  `${getISOWeekYear(date)}-W${String(getISOWeek(date)).padStart(2, '0')}`;

export enum DeliveryState {
  /** First session of this ISO week. The card is waiting for them. */
  Available = 'available',
  /** They opened it and left part-way. The card deep-links back. */
  Resumable = 'resumable',
  /** Handled this week. Collapsed row only, no interruption. */
  Seen = 'seen',
  /** Dismissed. Nothing until next Monday. */
  Dismissed = 'dismissed',
}

export interface DeliveryInput {
  now: Date;
  /** The session before this one. Null for a brand new account. */
  lastVisitAt: Date | null;
  /** ISO week key of the recap they last opened or dismissed. */
  handledWeek: string | null;
  /** Frame they stopped on, if they left mid-story. */
  resumeAtFrame?: number;
  dismissed?: boolean;
}

export interface Delivery {
  state: DeliveryState;
  mode: Mode;
  /** The ISO week key this recap is filed under. */
  key: string;
  /** Inclusive window the highlights are computed over. */
  window: { after: Date; before: Date };
  daysAway: number;
  resumeAtFrame?: number;
  /** Plain-language explanation, rendered in the delivery story. */
  reason: string;
}

/**
 * Generation happens Monday 00:00 in the user's own timezone, but delivery is
 * pull, not push: the recap sits claimable for the whole week and appears on
 * whichever day they next open the app. Monday and Saturday get the same card.
 */
export const resolveDelivery = ({
  now,
  lastVisitAt,
  handledWeek,
  resumeAtFrame,
  dismissed,
}: DeliveryInput): Delivery => {
  const key = weekKey(now);
  const daysAway = lastVisitAt
    ? Math.max(0, differenceInCalendarDays(now, lastVisitAt))
    : 0;

  const isCatchUp = !!lastVisitAt && daysAway > CATCH_UP_AFTER_DAYS;
  const mode = isCatchUp ? Mode.CatchUp : Mode.Weekly;

  // Weekly mode reports the ISO week that just closed. Catch-up reports the
  // gap itself, so an eleven-day absence is not narrated as though they had
  // seen the intervening Monday.
  const window = isCatchUp
    ? {
        after: new Date(
          Math.max(
            lastVisitAt.getTime(),
            subDays(now, CATCH_UP_MAX_DAYS).getTime(),
          ),
        ),
        before: now,
      }
    : {
        after: startOfISOWeek(subWeeks(now, 1)),
        before: subDays(startOfISOWeek(now), 1),
      };

  const base = { mode, key, window, daysAway, resumeAtFrame };

  if (handledWeek === key) {
    if (dismissed) {
      return {
        ...base,
        state: DeliveryState.Dismissed,
        reason: 'Dismissed this week. Returns next Monday, not before.',
      };
    }
    if (resumeAtFrame) {
      return {
        ...base,
        state: DeliveryState.Resumable,
        reason: `Opened and left on frame ${resumeAtFrame}. The card deep-links back to it.`,
      };
    }
    return {
      ...base,
      state: DeliveryState.Seen,
      reason:
        'Already seen this week. Collapses to a single row so daily visitors are not interrupted again.',
    };
  }

  return {
    ...base,
    state: DeliveryState.Available,
    reason: isCatchUp
      ? `Away ${daysAway} days. The window runs from their last visit instead of the ISO week, capped at ${CATCH_UP_MAX_DAYS} days.`
      : `First session of ${key}. Generated Monday, delivered on ${format(
          now,
          'EEEE',
        )}.`,
  };
};

/* -------------------------------------------------------------------------- */
/* Eligibility                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Who gets what size of deck, from spec v3 §6.
 *
 * The addressable weekly audience is ~26,500 not 83,853: 47% of weekly actives
 * open a post and only 31.7% open three or more. So the deck scales with what
 * the person actually did, and somebody who did nothing gets nothing. This
 * reverses the earlier "always render" rule on purpose: an empty recap is
 * worse than none.
 */
export enum Eligibility {
  /** Five or more opens (22.9%). The full deck. */
  Full = 'full',
  /** One to four opens (~24%). A reduced deck. */
  Reduced = 'reduced',
  /** No opens. Impressions alone say nothing about the person, so no Replay. */
  None = 'none',
}

export const eligibilityFor = ({
  opens,
  impressions,
}: {
  opens: number;
  impressions: number;
}): Eligibility => {
  if (opens >= 5) {
    return Eligibility.Full;
  }
  if (opens >= 1) {
    return Eligibility.Reduced;
  }
  return Eligibility.None;
};

const HIGHLIGHT_CAP: Record<Eligibility, number> = {
  [Eligibility.Full]: 5,
  [Eligibility.Reduced]: 3,
  [Eligibility.None]: 0,
};

/* -------------------------------------------------------------------------- */
/* Selection                                                                   */
/* -------------------------------------------------------------------------- */

const TIER_WEIGHT: Record<Tier, number> = {
  [Tier.Rare]: 3,
  [Tier.Story]: 2,
  [Tier.Stat]: 1,
};

/** The shareability ladder as a weight, on top of tier. Tier S leads. */
const SHARE_WEIGHT: Record<Shareability, number> = {
  [Shareability.S]: 1.6,
  [Shareability.A]: 1.2,
  [Shareability.B]: 0.8,
  [Shareability.C]: 0,
  [Shareability.Cut]: 0,
};

/**
 * One per family, not two. Attrition across the deck measured flat at 2-4
 * points per card, so length is cheap; variety is what runs out, and two
 * streak cards in a five-card deck is the fastest way to run out.
 */
export const FAMILY_CAP = 1;
/** Two staple slots per deck, so a deck never depends on a rare card firing. */
export const MIN_STAPLES = 2;
const DROP_BELOW = 0.6;

/**
 * A highlight type shown last week is worth almost nothing this week. This is
 * the load-bearing term in the whole engine: without it, week four is week one
 * with different numbers, and the open rate goes with it.
 */
export const novelty = (windowsAgo?: number): number => {
  if (windowsAgo === undefined) {
    return 1;
  }
  if (windowsAgo >= 4) {
    return 1;
  }
  if (windowsAgo >= 2) {
    return 0.45;
  }
  return 0.15;
};

export interface ScoredFrame {
  candidate: Candidate;
  /** 0..1, normalised against that candidate's own band. */
  magnitude: number;
  novelty: number;
  score: number;
}

export interface SelectionInput {
  mode: Mode;
  /** Candidate id to magnitude. An absent id means the candidate did not fire. */
  signals: Record<string, number>;
  /** Candidate id to how many windows ago it last appeared. */
  lastShown?: Record<string, number>;
  /** Posts opened this window. Drives eligibility. */
  opens: number;
  /** Posts that reached their feed this window. Feeds selectivity. */
  impressions: number;
  pool?: Candidate[];
}

export const scoreOf = (
  candidate: Candidate,
  magnitude: number,
  windowsAgo?: number,
): number =>
  TIER_WEIGHT[candidate.tier] *
  SHARE_WEIGHT[candidate.shareability] *
  magnitude *
  novelty(windowsAgo) *
  (candidate.standsAlone ? 1.15 : 1);

export interface Selection {
  eligibility: Eligibility;
  frames: ScoredFrame[];
  /** Everything that fired but lost, in score order. Shown in the stories. */
  rejected: ScoredFrame[];
  /** The Tier S card promoted to slot one. */
  hero?: string;
  /** Staples pulled in to reach the minimum. */
  stapledWith: string[];
  categorySpread: Record<Category, number>;
}

const spreadOf = (frames: ScoredFrame[]): Record<Category, number> =>
  frames.reduce(
    (acc, frame) => ({
      ...acc,
      [frame.candidate.category]: acc[frame.candidate.category] + 1,
    }),
    {
      [Category.Stat]: 0,
      [Category.Surprise]: 0,
      [Category.Community]: 0,
      [Category.Crown]: 0,
    } as Record<Category, number>,
  );

/**
 * The deck, from spec v3 §6.
 *
 * Card one is a Tier S payload card — never a welcome, never totals. The
 * measured leak in the Log was the opener: a third of the audience never
 * swiped past it. After that, attrition was flat, so the strongest card sits
 * early where people will actually see it rather than last where 44% never
 * arrive. Then at least two staples, then score, one per family.
 */
export const select = ({
  mode,
  signals,
  lastShown = {},
  opens,
  impressions,
  pool = catalog,
}: SelectionInput): Selection => {
  const eligibility = eligibilityFor({ opens, impressions });
  const cap = HIGHLIGHT_CAP[eligibility];
  const empty = { eligibility, frames: [], rejected: [], stapledWith: [], categorySpread: spreadOf([]) };

  if (eligibility === Eligibility.None) {
    return empty;
  }

  const eligible = pool.filter((candidate) => {
    if (candidate.modes && !candidate.modes.includes(mode)) {
      return false;
    }
    // C and Cut never render. Stat-tier are opener furniture that no longer
    // has an opener, so they never render either.
    if (
      candidate.shareability === Shareability.C ||
      candidate.shareability === Shareability.Cut ||
      candidate.tier === Tier.Stat
    ) {
      return false;
    }
    return signals[candidate.id] !== undefined;
  });

  const scored: ScoredFrame[] = eligible
    .map((candidate) => {
      const magnitude = signals[candidate.id] ?? 0;
      const windowsAgo = lastShown[candidate.id];
      return {
        candidate,
        magnitude,
        novelty: novelty(windowsAgo),
        score: scoreOf(candidate, magnitude, windowsAgo),
      };
    })
    .filter((frame) => frame.score >= DROP_BELOW)
    .sort((a, b) => b.score - a.score);

  const familyUsed = new Set<string>();
  const taken: ScoredFrame[] = [];

  const tryTake = (frame: ScoredFrame): boolean => {
    if (
      taken.length >= cap ||
      taken.includes(frame) ||
      familyUsed.has(frame.candidate.family)
    ) {
      return false;
    }
    familyUsed.add(frame.candidate.family);
    taken.push(frame);
    return true;
  };

  // 1. Card one: the best Tier S card. Rare ones promote here when they fire.
  const heroFrame = scored.find(
    (frame) => frame.candidate.shareability === Shareability.S,
  );
  if (heroFrame) {
    tryTake(heroFrame);
  }

  // 2. At least two staples, so the deck never depends on luck.
  const stapledWith: string[] = [];
  scored
    .filter((frame) => frame.candidate.staple)
    .forEach((frame) => {
      const staplesTaken = taken.filter((t) => t.candidate.staple).length;
      if (staplesTaken >= MIN_STAPLES) {
        return;
      }
      if (tryTake(frame)) {
        stapledWith.push(frame.candidate.id);
      }
    });

  // 3. The rest by score.
  scored.forEach((frame) => tryTake(frame));

  // Order: the hero stays at one, everything else descends. The strongest
  // card lands at one or two, never last.
  const ordered = heroFrame && taken.includes(heroFrame)
    ? [heroFrame, ...taken.filter((f) => f !== heroFrame).sort((a, b) => b.score - a.score)]
    : [...taken].sort((a, b) => b.score - a.score);

  return {
    eligibility,
    frames: ordered,
    rejected: scored.filter((frame) => !taken.includes(frame)),
    hero: heroFrame && taken.includes(heroFrame) ? heroFrame.candidate.id : undefined,
    stapledWith,
    categorySpread: spreadOf(ordered),
  };
};

/* -------------------------------------------------------------------------- */
/* The story                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The deck: the highlights, then the handoff. No opener.
 *
 * The welcome card was the measured leak — 8,656 of 26,530 Log openers never
 * swiped past it — so the first thing anyone sees is a payload card with a
 * real claim on it. The handoff still closes, because it is the one card that
 * asks for something and the ending is where that belongs.
 */
export const storyFrames = (selection: Selection): Candidate[] =>
  selection.eligibility === Eligibility.None
    ? []
    : [...selection.frames.map((frame) => frame.candidate), handoffFrame];
