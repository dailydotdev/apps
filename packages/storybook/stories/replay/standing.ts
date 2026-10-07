/**
 * Turns a rank inside a reference group into the one line a card may say.
 *
 * The rules come from the comparison research (plans/weekly-recap/research):
 * percentiles only for the top tenth, never rounded to zero, absolute rank
 * once the pool is small enough to count, a median comparison for the middle,
 * growth against the person's own past when nothing else holds, and silence
 * when the pool is too small to mean anything. Same input, same string, every
 * week: LeetCode's "beats X%" lost trust because it moved between runs.
 */

export enum StandingForm {
  /** "Top 4% of Kubernetes readers." Top tenth of a pool of a thousand or more. */
  Percentile = 'percentile',
  /** "#7 of 412 Zig readers." Pools under a thousand, or the top ten of any pool. */
  Rank = 'rank',
  /** "9 topics. Most developers read 3." The middle, against the median. */
  Median = 'median',
  /** "Up 2x on last week." Nobody else in the sentence. */
  Growth = 'growth',
  /** Nothing honest to say. The card does not render. */
  None = 'none',
}

export interface StandingInput {
  /** 1 is best. */
  rank: number;
  /** Developers in the reference group who were active this week. */
  pool: number;
  /** Plural noun for the group: "Kubernetes readers", "developers". */
  group: string;
  /** The person's own figure, for the median and growth forms. */
  value?: number;
  /** What the figure counts: "topics", "posts". */
  unit?: string;
  /** Median of the pool, for the middle. */
  median?: number;
  /** The same figure last week, for growth. */
  lastWeek?: number;
}

export interface StandingCopy {
  form: StandingForm;
  /** The big thing on the card. */
  figure: string;
  /** What the figure is of. */
  label: string;
  /** The six words that explain the denominator. */
  scope: string;
  /** 0 to 100 position along the standing bar. */
  pin: number;
}

/** Below this the group cannot carry a claim at all. */
export const MIN_POOL = 20;
/** Percentiles need a pool this big; smaller pools get an absolute rank. */
export const PERCENTILE_MIN_POOL = 1000;
/** A percentile is only said for the top tenth. */
export const PERCENTILE_CEILING = 10;
/** Top ten of anything is a rank, not a percentage. */
export const RANK_ALWAYS_AT = 10;

const formatCount = (n: number): string => n.toLocaleString('en-US');

/**
 * Spotify's "top 0.5%" stopped meaning anything once a third of the timeline
 * had one. If more than this share of the week's actives qualify for the same
 * headline tier, the job tightens the threshold before it sends.
 */
export const MAX_TIER_SHARE = 0.1;

export const isSaturated = (qualifying: number, actives: number): boolean =>
  actives > 0 && qualifying / actives > MAX_TIER_SHARE;

const NONE: StandingCopy = {
  form: StandingForm.None,
  figure: '',
  label: '',
  scope: '',
  pin: 0,
};

export const describeStanding = ({
  rank,
  pool,
  group,
  value,
  unit,
  median,
  lastWeek,
}: StandingInput): StandingCopy => {
  if (pool < MIN_POOL || rank < 1 || rank > pool) {
    return NONE;
  }

  const percent = (rank / pool) * 100;
  const pin = Math.max(2, Math.min(98, 100 - percent));

  if (rank <= RANK_ALWAYS_AT || pool < PERCENTILE_MIN_POOL) {
    if (percent <= PERCENTILE_CEILING || rank <= RANK_ALWAYS_AT) {
      return {
        form: StandingForm.Rank,
        figure: `#${rank}`,
        label: `of ${formatCount(pool)} ${group}`,
        scope: `${formatCount(pool)} ${group} active this week`,
        pin,
      };
    }
  } else if (percent <= PERCENTILE_CEILING) {
    return {
      form: StandingForm.Percentile,
      figure: `Top ${Math.max(1, Math.round(percent))}%`,
      label: `of ${group}`,
      scope: `Out of ${formatCount(pool)} who were active this week`,
      pin,
    };
  }

  if (value !== undefined && median !== undefined && value > median) {
    return {
      form: StandingForm.Median,
      figure: formatCount(value),
      label: unit ? `${unit} this week` : 'this week',
      scope: `Most ${group} land on ${formatCount(median)}`,
      pin: Math.max(52, pin),
    };
  }

  if (value !== undefined && lastWeek !== undefined && lastWeek > 0 && value > lastWeek) {
    const ratio = value / lastWeek;
    const figure =
      ratio >= 2 ? `${Math.round(ratio)}x` : `+${Math.round((ratio - 1) * 100)}%`;
    return {
      form: StandingForm.Growth,
      figure,
      label: 'on last week',
      scope: `${formatCount(lastWeek)} then, ${formatCount(value)} now`,
      pin: 50,
    };
  }

  return NONE;
};
