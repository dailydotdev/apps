import type { FeedItem } from '../hooks/useFeed';
import { FeedItemType } from '../components/cards/common/common';
import { PostType } from '../graphql/posts';

const WIDENABLE_POST_TYPES = new Set<PostType>([
  PostType.Article,
  PostType.VideoYouTube,
]);

/**
 * Structural eligibility check — does this post qualify for a wide hero
 * card layout? Used by gating logic to decide whether to evaluate the
 * post-highlight-cards feature flag.
 */
export const isHeroEligiblePost = (post: {
  type: PostType;
  hero?: { size?: number | null } | null;
}): boolean =>
  WIDENABLE_POST_TYPES.has(post.type) && (post.hero?.size ?? 1) > 1;

/**
 * Returns the column span a feed item is asking for, before any clamping
 * for column count or fit-to-row.
 *
 * Only Post items with an article-like type and an active `hero`
 * request a wide colSpan. Ads, highlight strip items, placeholders,
 * marketing items and non-article post types always stay at 1.
 */
const MAX_HERO_COL_SPAN = 4;

export const requestedColSpan = (item: FeedItem): number => {
  if (!item || item.type !== FeedItemType.Post) {
    return 1;
  }

  if (!WIDENABLE_POST_TYPES.has(item.post.type)) {
    return 1;
  }

  // Cap to MAX_HERO_COL_SPAN: `ArticleFeaturedWideGridCard` only has
  // designs for colSpan 2/3/4. If larger designes are needed support needs to
  // be added frontend first
  return Math.min(item.post.hero?.size ?? 1, MAX_HERO_COL_SPAN);
};

export interface FeedItemPlacement {
  colSpan: number;
  row: number;
  column: number;
}

export interface PlacementBuilderOptions {
  numCards: number;
  isMobile: boolean;
  isList: boolean;
  isEnabled: boolean;
  /**
   * Minimum number of items between two wide cards. Anchored to the index
   * of the last placed wide card; a wide card requested within this
   * distance shrinks to a regular 1-column card.
   */
  minSpacing: number;
  /**
   * Items at indices `[0, startIndex)` are forced to colSpan 1. Used to
   * preserve the position of early ad slots that wide cards would
   * otherwise displace.
   */
  startIndex: number;
}

export interface ComputePlacementsOptions extends PlacementBuilderOptions {
  /**
   * Indices that have a full-row insertion (brief banner, hero, promo)
   * rendered BEFORE the item at that index. The current row tail is left
   * empty (browser auto-flow does not backtrack), the banner consumes a
   * row of its own, and the item at this index starts on the next fresh
   * row at column 0.
   */
  fullRowInsertionBeforeIndex?: ReadonlySet<number>;
  /**
   * Ad cadence parameters. When provided, wide cards are clamped so
   * their right edge does not cross the next scheduled ad slot
   * (visualCellsSoFar === adStart + n*adRepeat). Without this, a wide
   * card straddling a slot would silently drop that ad.
   */
  adStart?: number;
  adRepeat?: number;
}

export interface PlacementBuilder {
  next(
    item: FeedItem,
    opts?: {
      fullRowBefore?: boolean;
      /**
       * Upper bound for `colSpan` on this item. Used by callers to enforce
       * an external constraint (e.g. "don't let this wide card straddle
       * the next ad slot"). Combined via Math.min with the in-built fit
       * limits (numCards, remaining-in-row).
       */
      maxColSpan?: number;
    },
  ): FeedItemPlacement;
}

/**
 * Stateful walker over feed items. Encapsulates the placement rule
 * (wide-card density cap, startIndex gate, fit-to-row clamp,
 * banner-aware row tracking) so both `useFeed` (visual-cell-based ad
 * cadence) and `computePlacements` (final rendering with banner
 * awareness) share one implementation.
 */
export const createPlacementBuilder = ({
  numCards,
  isMobile,
  isList,
  isEnabled,
  minSpacing,
  startIndex,
}: PlacementBuilderOptions): PlacementBuilder => {
  const layoutEnabled = isEnabled && !isMobile && !isList && numCards > 1;
  const safeNumCards = Math.max(numCards, 1);

  let row = 0;
  let col = 0;
  let lastLargeIndex = -Infinity;
  let itemIdx = 0;

  return {
    next(
      item,
      { fullRowBefore = false, maxColSpan = Infinity } = {},
    ): FeedItemPlacement {
      if (!layoutEnabled) {
        const placement: FeedItemPlacement = {
          colSpan: 1,
          row: Math.floor(itemIdx / safeNumCards),
          column: itemIdx % safeNumCards,
        };
        itemIdx += 1;
        return placement;
      }

      if (fullRowBefore) {
        if (col !== 0) {
          row += 1;
        }
        row += 1;
        col = 0;
      }

      const requested = requestedColSpan(item);
      const actual = ((): number => {
        if (requested === 1) {
          return 1;
        }
        if (itemIdx < startIndex) {
          return 1;
        }
        if (itemIdx - lastLargeIndex < minSpacing) {
          return 1;
        }
        const clampedToGrid = Math.min(requested, numCards);
        const remainingInRow = numCards - col;
        return Math.max(1, Math.min(clampedToGrid, remainingInRow, maxColSpan));
      })();

      const placement: FeedItemPlacement = {
        colSpan: actual,
        row,
        column: col,
      };

      if (actual > 1) {
        lastLargeIndex = itemIdx;
      }

      col += actual;
      if (col >= numCards) {
        row += 1;
        col = 0;
      }
      itemIdx += 1;

      return placement;
    },
  };
};

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
  options: ComputePlacementsOptions,
): FeedItemPlacement[] => {
  const { fullRowInsertionBeforeIndex, adStart, adRepeat } = options;
  const builder = createPlacementBuilder(options);
  const hasAdCadence =
    typeof adStart === 'number' && typeof adRepeat === 'number' && adRepeat > 0;
  let vcs = 0;

  return items.map((item, index) => {
    const fullRowBefore = fullRowInsertionBeforeIndex?.has(index) ?? false;
    // Derive the next ad slot from vcs directly. Robust to ad slots being
    // absent from `items` (e.g. when useFeed swapped the slot for a
    // marketing CTA) — vcs alone tells us how many slot positions we
    // have passed.
    const slotsPassed = hasAdCadence
      ? Math.max(0, Math.floor((vcs - adStart + adRepeat) / adRepeat))
      : 0;
    const nextAdVcs = hasAdCadence ? adStart + slotsPassed * adRepeat : 0;
    const maxColSpan = hasAdCadence ? Math.max(1, nextAdVcs - vcs) : Infinity;
    const placement = builder.next(item, { fullRowBefore, maxColSpan });
    vcs += placement.colSpan;
    return placement;
  });
};
