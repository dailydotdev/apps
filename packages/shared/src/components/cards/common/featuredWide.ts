import type { PostCardProps } from './common';

export type FeaturedWideColSpan = 2 | 3 | 4;

export type FeaturedWideCardProps = PostCardProps & {
  wideColSpan?: FeaturedWideColSpan;
  /**
   * The standalone hero treatment: the cover is cropped to fill its column
   * instead of being letterboxed, and the text trades headline size for lines
   * because it runs in a third of the card's width. The in-feed wide cards
   * share a row with normal cards and keep the original sizes.
   */
  hero?: boolean;
};

export const TITLE_CLASS_NAME = 'line-clamp-4 typo-title1';
export const HERO_TITLE_CLASS_NAME = 'line-clamp-5 typo-title2';
export const DESCRIPTION_CLASS_NAME = 'line-clamp-3';

/**
 * The hero's card height is fixed, so a headline that runs to five lines would
 * otherwise push the action row out through the bottom edge. `base.css` resets
 * every element to `flex-shrink: 0`, so this block and the summary opt back in:
 * the summary is the only shrinkable child, which makes it the one that gives
 * way while the headline above it keeps every line. `grow` so the block's floor
 * is the action row rather than wherever its own copy happens to end, which is
 * what `useFittedLineClamp` measures down to.
 */
export const HERO_TEXT_FIT_CLASS_NAME = 'min-h-0 shrink grow overflow-hidden';

/**
 * Six is the ceiling, not the count — the measured fit replaces it whenever the
 * headline above leaves room for fewer. Kept as a class so the first paint,
 * before anything has been measured, is already close.
 */
export const HERO_DESCRIPTION_CLASS_NAME = 'line-clamp-6 min-h-0 shrink';
export const HERO_DESCRIPTION_MAX_LINES = 6;

/**
 * The hero card sizes itself against its own width rather than the viewport's:
 * the section is capped at the feed grid's width, which follows the reader's
 * card-count setting, so a wide monitor showing three cards gives this card
 * half the room a five-card feed does.
 *
 * Narrow, the cover sits under the copy; from 40rem it takes a column beside
 * it; from 52rem the copy keeps two of five for the 40/60 split. Needs
 * `@container/wide` on an ancestor — the carousel slide provides it, which is
 * why in-feed wide cards keep their prop-driven spans.
 */
const HERO_INNER_GRID_CLASS_NAME =
  'grid-cols-1 grid-rows-[minmax(0,1fr)_10rem] @[40rem]/wide:grid-cols-2 @[40rem]/wide:grid-rows-[minmax(0,1fr)] @[52rem]/wide:grid-cols-5';

const HERO_TEXT_COL_CLASS_NAME =
  'col-span-1 row-start-1 @[52rem]/wide:col-span-2';

const HERO_IMAGE_COL_CLASS_NAME =
  'col-span-1 row-start-2 @[40rem]/wide:row-start-1 @[52rem]/wide:col-span-3';

export const INNER_GRID_COLS: Record<FeaturedWideColSpan, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

export const IMAGE_COL_SPAN: Record<FeaturedWideColSpan, string> = {
  2: 'col-span-1',
  3: 'col-span-2',
  4: 'col-span-3',
};

type FeaturedWideLayout = {
  hasMedia: boolean;
  wideColSpan: FeaturedWideColSpan;
  hero?: boolean;
};

export const featuredWideGridClass = ({
  hasMedia,
  wideColSpan,
  hero,
}: FeaturedWideLayout): string => {
  if (!hasMedia) {
    return 'grid-cols-1';
  }

  return hero ? HERO_INNER_GRID_CLASS_NAME : INNER_GRID_COLS[wideColSpan];
};

/**
 * Only the hero states a span: with a single image column beside it the text
 * takes one column by default, which is what every other span comes to.
 */
export const featuredWideTextColClass = ({
  hasMedia,
  hero,
}: Pick<FeaturedWideLayout, 'hasMedia' | 'hero'>): string | undefined =>
  hasMedia && hero ? HERO_TEXT_COL_CLASS_NAME : undefined;

export const featuredWideImageColClass = ({
  wideColSpan,
  hero,
}: Pick<FeaturedWideLayout, 'wideColSpan' | 'hero'>): string =>
  hero ? HERO_IMAGE_COL_CLASS_NAME : IMAGE_COL_SPAN[wideColSpan];
