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
export const DESCRIPTION_CLASS_NAME = 'line-clamp-3';

/**
 * The hero's card height is fixed, so a headline that runs to five lines would
 * otherwise push the action row out through the bottom edge. `base.css` resets
 * every element to `flex-shrink: 0`, so the text block and the summary opt back
 * in: the summary is the only shrinkable child, which makes it the one that
 * gives way while the headline above it keeps every line.
 */
/**
 * The bottom padding matches the fade, so at full height the gradient covers
 * only padding and the last line stays solid; once the block is squeezed the
 * padding goes first and the line being cut fades out instead of showing a row
 * of sliced glyphs. The padding belongs here rather than on the summary because
 * `overflow: hidden` clips at the padding edge, which would let a seventh line
 * leak out past the clamp.
 */
export const HERO_TEXT_FIT_CLASS_NAME =
  'min-h-0 shrink overflow-hidden pb-5 [mask-image:linear-gradient(to_bottom,black_calc(100%-1.25rem),transparent)]';
export const HERO_DESCRIPTION_CLASS_NAME = 'line-clamp-6 min-h-0 shrink';

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
