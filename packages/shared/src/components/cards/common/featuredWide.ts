import type { PostCardProps } from './common';

export type FeaturedWideColSpan = 2 | 3 | 4;

export type FeaturedWideCardProps = PostCardProps & {
  wideColSpan?: FeaturedWideColSpan;
  /** The standalone hero treatment, sized from the card's own width. */
  hero?: boolean;
};

export const TITLE_CLASS_NAME = 'line-clamp-4 typo-title1';
export const HERO_TITLE_CLASS_NAME = 'line-clamp-5 typo-title2';
export const DESCRIPTION_CLASS_NAME = 'line-clamp-3';

/**
 * `base.css` resets every element to `flex-shrink: 0`, so the text block has to
 * opt back in; the summary is then the only shrinkable child, and gives way
 * before the headline does. `grow` puts the block's floor at the action row,
 * which is what `useFittedLineClamp` measures down to.
 */
export const HERO_TEXT_FIT_CLASS_NAME = 'min-h-0 shrink grow overflow-hidden';

/** A ceiling for the first paint; `useFittedLineClamp` replaces it once measured. */
export const HERO_DESCRIPTION_CLASS_NAME = 'line-clamp-6 min-h-0 shrink';
export const HERO_DESCRIPTION_MAX_LINES = 6;

/**
 * Container queries, not viewport ones: the hero is only ever as wide as the
 * reader's feed grid, so a wide monitor set to three cards gives this card half
 * the room a five-card feed does. Needs `@container/wide` on an ancestor, which
 * the carousel slide provides.
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

/** Only the hero states a span; every other layout's text column defaults to 1. */
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
