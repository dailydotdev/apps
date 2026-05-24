import type { FeedItem } from '../hooks/useFeed';
import { FeedItemType } from '../components/cards/common/common';

/**
 * Allowed multi-card layout sizes for feed items.
 * Format is `colSpan x rowSpan`.
 *
 * NOTE: Backend will eventually emit one of these values per feed item via
 * `Post.layoutHint`. Until then, the FE treats all items as `1x1` so behavior
 * is unchanged when the field is missing.
 *
 * Supported sizes: `1x1`, `2x1`, `3x1`, `4x1` (horizontal wide cards) and
 * `1x2` (vertical Happening Now card). Sizes `2x2`, `3x2` are not allowed yet.
 */
export const LAYOUT_HINT_VALUES = ['1x1', '1x2', '2x1', '3x1', '4x1'] as const;

export type LayoutHint = (typeof LAYOUT_HINT_VALUES)[number];

export const DEFAULT_LAYOUT_HINT: LayoutHint = '1x1';

export interface LayoutHintDimensions {
  colSpan: number;
  rowSpan: number;
}

/**
 * Layout dimensions used by the feed grid packer.
 */
const LAYOUT_HINT_DIMENSIONS: Record<LayoutHint, LayoutHintDimensions> = {
  '1x1': { colSpan: 1, rowSpan: 1 },
  '1x2': { colSpan: 1, rowSpan: 2 },
  '2x1': { colSpan: 2, rowSpan: 1 },
  '3x1': { colSpan: 3, rowSpan: 1 },
  '4x1': { colSpan: 4, rowSpan: 1 },
};

/**
 * Density / "is large" classification stays semantic — based on the original
 * hint area — so the density cap (1 large per 10 items) keeps doing the
 * right thing.
 */
const LAYOUT_HINT_AREA: Record<LayoutHint, number> = {
  '1x1': 1,
  '1x2': 2,
  '2x1': 2,
  '3x1': 3,
  '4x1': 4,
};

/** Largest size a sponsored / ad item is allowed to occupy. */
export const AD_MAX_LAYOUT_HINT: LayoutHint = '2x1';

/**
 * Fallback chain used when the requested size cannot fit the current row.
 * Wider hints downgrade to the next narrower size before falling back to 1x1.
 */
export const LAYOUT_HINT_FALLBACK_CHAIN: Record<LayoutHint, LayoutHint[]> = {
  '4x1': ['4x1', '3x1', '2x1', '1x1'],
  '3x1': ['3x1', '2x1', '1x1'],
  '2x1': ['2x1', '1x1'],
  '1x2': ['1x2', '1x1'],
  '1x1': ['1x1'],
};

export const isLayoutHint = (value: unknown): value is LayoutHint =>
  typeof value === 'string' &&
  (LAYOUT_HINT_VALUES as readonly string[]).includes(value);

export const getLayoutHintDimensions = (
  hint: LayoutHint,
): LayoutHintDimensions => LAYOUT_HINT_DIMENSIONS[hint];

export const isLargeLayoutHint = (hint: LayoutHint): boolean =>
  LAYOUT_HINT_AREA[hint] > 1;

interface ResolveLayoutHintParams {
  rawHint: unknown;
  itemType: FeedItemType;
  /** When true, force `1x1` (mobile uses 1 column). */
  isMobile: boolean;
  /** When true, multi-card layout is disabled entirely (flag off). */
  isDisabled: boolean;
}

/**
 * Resolves the effective layout hint for a feed item with the safety rules
 * locked by product:
 *  - feature flag off / mobile / unsupported item type -> 1x1
 *  - invalid backend value -> 1x1
 *  - ad items capped at 2x1
 */
export const resolveLayoutHint = ({
  rawHint,
  itemType,
  isMobile,
  isDisabled,
}: ResolveLayoutHintParams): LayoutHint => {
  if (isDisabled || isMobile) {
    return DEFAULT_LAYOUT_HINT;
  }

  if (
    itemType !== FeedItemType.Post &&
    itemType !== FeedItemType.Ad &&
    itemType !== FeedItemType.Highlight
  ) {
    return DEFAULT_LAYOUT_HINT;
  }

  if (!isLayoutHint(rawHint)) {
    return DEFAULT_LAYOUT_HINT;
  }

  if (
    itemType === FeedItemType.Ad &&
    LAYOUT_HINT_AREA[rawHint] > LAYOUT_HINT_AREA[AD_MAX_LAYOUT_HINT]
  ) {
    return AD_MAX_LAYOUT_HINT;
  }

  return rawHint;
};

/**
 * Reads the raw `layoutHint` from a feed item without coupling to GraphQL
 * shape. Backend may attach the hint to either the post or the ad-wrapped
 * post, so we look in both spots.
 *
 * Cast through `Record<string, unknown>` because `layoutHint` is not yet in
 * the shared GraphQL types; once backend ships, replace with a typed field.
 */
export const getRawLayoutHintFromItem = (item: FeedItem): unknown => {
  if (item.type === FeedItemType.Post) {
    return (item.post as unknown as Record<string, unknown>)?.layoutHint;
  }

  if (item.type === FeedItemType.Highlight) {
    return (item as unknown as Record<string, unknown>)?.layoutHint;
  }

  if (item.type === FeedItemType.Ad) {
    const adPost = (item.ad?.data?.post ?? null) as unknown as Record<
      string,
      unknown
    > | null;
    return adPost?.layoutHint;
  }

  return undefined;
};

/**
 * Deterministic dev-only seed used until backend emits `layoutHint`.
 * Each slot sits in its own 10-item density window so the packer's
 * "1 large per 10 items" cap does not downgrade any of them.
 *
 *   index 7  -> 2x1 featured article
 *   index 14 -> 3x1 featured article (falls back to 2x1 on < 3 columns)
 *   index 21 -> 4x1 featured article (falls back to 3x1/2x1 on < 4 columns)
 *   index 32 -> 2x1 Top active squads
 *   index 42 -> 2x1 Popular tags
 *   pattern repeats every 50 items
 */
export type DevSeededWideVariant = 'featuredArticle' | 'topSquads' | 'popularTags';

interface DevSeedSlot {
  hint: LayoutHint;
  variant: DevSeededWideVariant;
}

const DEV_SEED_PATTERN: Record<number, DevSeedSlot> = {
  7: { hint: '2x1', variant: 'featuredArticle' },
  14: { hint: '3x1', variant: 'featuredArticle' },
  21: { hint: '4x1', variant: 'featuredArticle' },
  32: { hint: '2x1', variant: 'topSquads' },
  42: { hint: '2x1', variant: 'popularTags' },
};

const DEV_SEED_CYCLE = 50;

export const getDevSeededLayoutHint = (index: number): LayoutHint | undefined =>
  DEV_SEED_PATTERN[index % DEV_SEED_CYCLE]?.hint;

export const getDevSeededWideVariant = (
  index: number,
): DevSeededWideVariant | undefined =>
  DEV_SEED_PATTERN[index % DEV_SEED_CYCLE]?.variant;
