/**
 * Where the section puts the placement. `column` is the full card in a column
 * of its own; `none` hands it back to the feed, which places it exactly as it
 * does with no hero at all.
 */
export type FeedHeroAdPlacement = 'none' | 'column';

/**
 * Which card the featured post takes.
 *
 * `stacked` is one column: the lead story as a list card with the headline list
 * under it, which is what the feed's own list view gets. `split` is one feed
 * column wide, which takes the platform's standard card — the wide card's own
 * layout has nothing left to trade at that size and its copy clips mid-
 * sentence. `wide` is two columns or more, where the wide card earns its shape
 * back.
 */
export type FeedHeroLayout = 'stacked' | 'split' | 'wide';

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
 * The hero's row, laid out on the feed grid's columns instead of on thresholds
 * of its own, so the section reflows when the feed does and its column edges
 * land on the grid's rather than beside them.
 *
 * The rail holds a single column until there are enough to spare it a second,
 * and the ad earns one from four columns up — below that the feed keeps the
 * placement rather than the hero squeezing it in. The featured card takes
 * whatever is left, which is what makes the row come out exactly as wide as the
 * grid beneath it however many columns that is.
 *
 * A feed rendering as a list takes the one-column shape whatever its column
 * count says, so the section reads as the same kind of thing as the rows under
 * it.
 */
export const feedHeroShape = (
  columns: number,
  isList = false,
): FeedHeroShape => {
  if (isList || columns <= 1) {
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
