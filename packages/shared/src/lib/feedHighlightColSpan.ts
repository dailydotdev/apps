import type { FeedItem } from '../hooks/useFeed';
import { FeedItemType } from '../components/cards/common/common';
import { PostType } from '../graphql/posts';
import type { PostHighlightSignificance } from '../graphql/posts';

const SIGNIFICANCE_COL_SPAN: Record<PostHighlightSignificance, number> = {
  breaking: 4,
  major: 3,
  notable: 2,
  routine: 1,
};

const WIDENABLE_POST_TYPES = new Set<PostType>([
  PostType.Article,
  PostType.VideoYouTube,
]);

/**
 * Returns the column span a feed item is asking for, before any clamping
 * for column count or fit-to-row.
 *
 * Only Post items with an article-like type and an active `postHighlight`
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

  const significance = item.post.postHighlight?.significance;
  if (!significance) {
    return 1;
  }

  return SIGNIFICANCE_COL_SPAN[significance] ?? 1;
};

export interface ComputeColSpansOptions {
  numCards: number;
  isMobile: boolean;
  isList: boolean;
  /**
   * Indices that have a full-row insertion (brief banner, hero, promo)
   * rendered BEFORE the item at that index. The column tracker resets to
   * column 0 before placing the item, so the item starts a fresh row.
   */
  fullRowInsertionBeforeIndex?: ReadonlySet<number>;
}

/**
 * Walks feed items in order and assigns each one a column span. Wide cards
 * never bump to a new row — when the requested colSpan exceeds the
 * remaining columns in the current row, it shrinks to fit. That keeps the
 * grid gap-free without needing `grid-auto-flow: dense`.
 *
 * Returns an array of colSpans (1..numCards) the same length as `items`.
 */
export const computeColSpans = (
  items: FeedItem[],
  {
    numCards,
    isMobile,
    isList,
    fullRowInsertionBeforeIndex,
  }: ComputeColSpansOptions,
): number[] => {
  if (isMobile || isList || numCards <= 1) {
    return items.map(() => 1);
  }

  const colSpans = new Array<number>(items.length);
  let col = 0;

  items.forEach((item, index) => {
    if (fullRowInsertionBeforeIndex?.has(index) && col !== 0) {
      col = 0;
    }

    const requested = requestedColSpan(item);
    if (requested === 1) {
      colSpans[index] = 1;
      col = (col + 1) % numCards;
      return;
    }

    const clampedToGrid = Math.min(requested, numCards);
    const remainingInRow = numCards - col;
    const actual = Math.min(clampedToGrid, remainingInRow);

    colSpans[index] = actual;
    col = (col + actual) % numCards;
  });

  return colSpans;
};
