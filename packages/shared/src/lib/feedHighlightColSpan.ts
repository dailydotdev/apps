import type { FeedItem } from '../hooks/useFeed';
import { FeedItemType } from '../components/cards/common/common';
import { PostType } from '../graphql/posts';
import type { PostHeroSignificance } from '../graphql/posts';

const SIGNIFICANCE_COL_SPAN: Record<PostHeroSignificance, number> = {
  breaking: 4,
  major: 3,
  notable: 2,
  routine: 1,
  breakout: 4,
  evergreen: 3,
};

const WIDENABLE_POST_TYPES = new Set<PostType>([
  PostType.Article,
  PostType.VideoYouTube,
]);

/**
 * Minimum number of items between two wide cards. Anchored to the index of
 * the last placed wide card, so a wide card requested within this distance
 * shrinks to a regular 1-column card. Keeps visual rhythm consistent and
 * avoids back-to-back wides at window boundaries.
 */
const LARGE_CARD_DENSITY = { minSpacing: 10 } as const;

/**
 * Returns the column span a feed item is asking for, before any clamping
 * for column count or fit-to-row.
 *
 * Only Post items with an article-like type and an active `hero`
 * request a wide colSpan. Ads, highlight strip items, placeholders,
 * marketing items and non-article post types always stay at 1.
 */
export const requestedColSpan = (item: FeedItem): number => {
  if (!item || item.type !== FeedItemType.Post) {
    return 1;
  }

  if (!WIDENABLE_POST_TYPES.has(item.post.type)) {
    return 1;
  }

  const significance = item.post.hero?.significance;
  if (!significance) {
    return 1;
  }

  return SIGNIFICANCE_COL_SPAN[significance] ?? 1;
};

export interface FeedItemPlacement {
  colSpan: number;
  row: number;
  column: number;
}

export interface ComputePlacementsOptions {
  numCards: number;
  isMobile: boolean;
  isList: boolean;
  isEnabled: boolean;
  /**
   * Indices that have a full-row insertion (brief banner, hero, promo)
   * rendered BEFORE the item at that index. The current row tail is left
   * empty (browser auto-flow does not backtrack), the banner consumes a
   * row of its own, and the item at this index starts on the next fresh
   * row at column 0.
   */
  fullRowInsertionBeforeIndex?: ReadonlySet<number>;
}

/**
 * Walks feed items in order and assigns each one a placement
 * (`colSpan`, `row`, `column`) reflecting actual visual position in the
 * grid. Wide cards never bump to a new row — when the requested colSpan
 * exceeds the remaining columns in the current row, it shrinks to fit.
 * That keeps the grid gap-free without needing `grid-auto-flow: dense`.
 *
 * Used by `Feed.tsx` for both rendering (inline `gridColumn: span N`) and
 * for accurate row/column analytics on impressions.
 */
export const computePlacements = (
  items: FeedItem[],
  {
    numCards,
    isMobile,
    isList,
    isEnabled,
    fullRowInsertionBeforeIndex,
  }: ComputePlacementsOptions,
): FeedItemPlacement[] => {
  if (!isEnabled || isMobile || isList || numCards <= 1) {
    return items.map((_, index) => ({
      colSpan: 1,
      row: Math.floor(index / Math.max(numCards, 1)),
      column: index % Math.max(numCards, 1),
    }));
  }

  const placements = new Array<FeedItemPlacement>(items.length);
  let row = 0;
  let col = 0;
  let lastLargeIndex = -Infinity;

  items.forEach((item, index) => {
    if (fullRowInsertionBeforeIndex?.has(index)) {
      // Browser auto-flow does not backtrack: an unfinished row left of the
      // full-row banner stays empty, and the banner occupies the next row
      // by itself.
      if (col !== 0) {
        row += 1;
      }
      row += 1;
      col = 0;
    }

    const requested = requestedColSpan(item);

    let actual: number;
    if (requested === 1) {
      actual = 1;
    } else if (index - lastLargeIndex < LARGE_CARD_DENSITY.minSpacing) {
      actual = 1;
    } else {
      const clampedToGrid = Math.min(requested, numCards);
      const remainingInRow = numCards - col;
      actual = Math.min(clampedToGrid, remainingInRow);
    }

    placements[index] = { colSpan: actual, row, column: col };

    if (actual > 1) {
      lastLargeIndex = index;
    }

    col += actual;
    if (col >= numCards) {
      row += 1;
      col = 0;
    }
  });

  return placements;
};
