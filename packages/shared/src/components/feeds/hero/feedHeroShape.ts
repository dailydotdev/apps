/** `none` hands the placement back to the feed, which shows it in its own slot. */
export type FeedHeroAdPlacement = 'none' | 'column';

/**
 * Which card the featured post takes: `stacked` a list card, `split` the
 * standard grid card, `wide` the featured-wide card. The wide card's copy
 * clips mid-sentence at one column, which is why `split` exists.
 */
export type FeedHeroLayout = 'stacked' | 'split' | 'wide';

/**
 * Widest row the section has column classes written out for — Tailwind only
 * generates what it can see, so `FeedHeroSection`'s maps stop here too. A count
 * beyond it stacks rather than laying out on classes that do not exist.
 */
export const MAX_HERO_COLUMNS = 6;

export type FeedHeroShape = {
  /** Columns in the hero's row — the feed grid's own count. */
  columns: number;
  featuredSpan: number;
  railSpan: number;
  /** 0 when the ad has no column of its own. */
  adSpan: number;
  layout: FeedHeroLayout;
  adPlacement: FeedHeroAdPlacement;
};

/**
 * The hero's row, laid out on the feed grid's own column count rather than on
 * viewport thresholds, so the section reflows when the feed does and its column
 * edges land on the grid's. The featured card takes what the rail and the ad
 * leave, which is what keeps the row exactly as wide as the grid beneath it.
 */
export const feedHeroShape = (
  columns: number,
  isList = false,
): FeedHeroShape => {
  if (isList || columns <= 1 || columns > MAX_HERO_COLUMNS) {
    return {
      columns: 1,
      featuredSpan: 1,
      railSpan: 1,
      adSpan: 0,
      layout: 'stacked',
      adPlacement: 'none',
    };
  }

  const adSpan = columns >= 4 ? 1 : 0;
  const railSpan = columns >= 6 ? 2 : 1;
  const featuredSpan = columns - railSpan - adSpan;

  return {
    columns,
    featuredSpan,
    railSpan,
    adSpan,
    layout: featuredSpan > 1 ? 'wide' : 'split',
    adPlacement: adSpan > 0 ? 'column' : 'none',
  };
};
