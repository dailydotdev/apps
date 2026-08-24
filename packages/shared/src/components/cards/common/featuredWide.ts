import type { PostCardProps } from './common';

export type FeaturedWideColSpan = 2 | 3 | 4 | 5;

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
export const DESCRIPTION_CLAMP_CLASS_NAME = 'line-clamp-3';
export const HERO_DESCRIPTION_CLAMP_CLASS_NAME = 'line-clamp-6';

export const INNER_GRID_COLS: Record<FeaturedWideColSpan, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
};

export const IMAGE_COL_SPAN: Record<FeaturedWideColSpan, string> = {
  2: 'col-span-1',
  3: 'col-span-2',
  4: 'col-span-3',
  5: 'col-span-3',
};

/**
 * Every span but 5 leaves the text a single column. 5 exists for the 40/60
 * split, which is two of five — the only ratio here that needs saying.
 */
export const TEXT_COL_SPAN: Record<FeaturedWideColSpan, string> = {
  2: 'col-span-1',
  3: 'col-span-1',
  4: 'col-span-1',
  5: 'col-span-2',
};
