import type { Ad, Post } from '../graphql/posts';
import type { PostHeroSignificance } from '../graphql/types';
import { PostType } from '../graphql/posts';
import type { FeedItem } from '../hooks/useFeed';
import { FeedItemType } from '../components/cards/common/common';
import {
  computePlacements,
  createPlacementBuilder,
  requestedColSpan,
} from './feedHighlightColSpan';

const SIZE_BY_SIGNIFICANCE: Record<PostHeroSignificance, number> = {
  breaking: 4,
  major: 3,
  notable: 2,
  routine: 1,
  breakout: 3,
  evergreen: 2,
};

const makePost = (
  overrides: Partial<Post> & {
    significance?: PostHeroSignificance | null;
  } = {},
): Post => {
  const { significance, ...rest } = overrides;
  return {
    id: rest.id ?? 'p1',
    type: rest.type ?? PostType.Article,
    image: '',
    commentsPermalink: '',
    ...(significance !== undefined && {
      hero: significance
        ? {
            id: 'h1',
            highlightedAt: '2026-05-25T00:00:00.000Z',
            headline: 'h',
            significance,
            size: SIZE_BY_SIGNIFICANCE[significance],
          }
        : null,
    }),
    ...rest,
  } as Post;
};

const makePostItem = (post: Post): FeedItem =>
  ({ type: FeedItemType.Post, post } as FeedItem);

const makeAdItem = (): FeedItem =>
  ({
    type: FeedItemType.Ad,
    ad: {
      source: 'a',
      company: 'c',
      link: '',
      description: '',
      image: '',
    } as Ad,
  } as FeedItem);

describe('requestedColSpan', () => {
  it('returns 1 for items without hero', () => {
    expect(requestedColSpan(makePostItem(makePost()))).toBe(1);
  });

  it.each<[PostHeroSignificance, number]>([
    ['breaking', 4],
    ['major', 3],
    ['notable', 2],
    ['routine', 1],
    ['breakout', 3],
    ['evergreen', 2],
  ])('maps %s significance to span %i', (significance, expected) => {
    expect(requestedColSpan(makePostItem(makePost({ significance })))).toBe(
      expected,
    );
  });

  it('returns 1 for ad items even when their post has a highlight', () => {
    expect(requestedColSpan(makeAdItem())).toBe(1);
  });

  it('returns 1 for non-article post types with a highlight', () => {
    expect(
      requestedColSpan(
        makePostItem(
          makePost({ type: PostType.Share, significance: 'breaking' }),
        ),
      ),
    ).toBe(1);
  });

  it('allows widening for VideoYouTube posts', () => {
    expect(
      requestedColSpan(
        makePostItem(
          makePost({ type: PostType.VideoYouTube, significance: 'major' }),
        ),
      ),
    ).toBe(3);
  });
});

describe('createPlacementBuilder', () => {
  const opts = {
    numCards: 4,
    isMobile: false,
    isList: false,
    isEnabled: true,
    minSpacing: 10,
    startIndex: 0,
  };

  it('returns colSpan 1 with naive row/col when layout is disabled', () => {
    const builder = createPlacementBuilder({ ...opts, isEnabled: false });
    const items = Array.from({ length: 5 }, () =>
      makePostItem(makePost({ significance: 'breaking' })),
    );
    expect(items.map((item) => builder.next(item))).toEqual([
      { colSpan: 1, row: 0, column: 0 },
      { colSpan: 1, row: 0, column: 1 },
      { colSpan: 1, row: 0, column: 2 },
      { colSpan: 1, row: 0, column: 3 },
      { colSpan: 1, row: 1, column: 0 },
    ]);
  });

  it('returns colSpan 1 on mobile regardless of significance', () => {
    const builder = createPlacementBuilder({ ...opts, isMobile: true });
    const item = makePostItem(makePost({ significance: 'breaking' }));
    expect(builder.next(item).colSpan).toBe(1);
  });

  it('produces identical placements to computePlacements for a sample sequence', () => {
    const items = [
      makePostItem(makePost({ significance: 'major' })),
      makePostItem(makePost()),
      makePostItem(makePost()),
      makePostItem(makePost()),
      makePostItem(makePost({ significance: 'breaking' })),
    ];
    const builder = createPlacementBuilder(opts);
    const builderPlacements = items.map((item) => builder.next(item));
    expect(builderPlacements).toEqual(computePlacements(items, opts));
  });

  it('counts shrunk wide cards as 1 cell for ad-cadence math', () => {
    // First "breaking" fits at col 0 of row 0 (colSpan 4). The second
    // "breaking" loses to the density cap (minSpacing 10) and shrinks to 1.
    // Visual cell total: 4 + 1 + 1 + 1 + 1 = 8 — not 4 + 1 + 1 + 1 + 4 = 11.
    const builder = createPlacementBuilder(opts);
    const items = [
      makePostItem(makePost({ significance: 'breaking' })),
      makePostItem(makePost()),
      makePostItem(makePost()),
      makePostItem(makePost()),
      makePostItem(makePost({ significance: 'breaking' })),
    ];
    const total = items.reduce(
      (sum, item) => sum + builder.next(item).colSpan,
      0,
    );
    expect(total).toBe(8);
  });

  it('honors fullRowBefore by skipping the partial-row tail and banner row', () => {
    const builder = createPlacementBuilder(opts);
    const items = [
      makePostItem(makePost()),
      makePostItem(makePost()),
      makePostItem(makePost()),
    ];
    expect([
      builder.next(items[0]),
      builder.next(items[1]),
      builder.next(items[2], { fullRowBefore: true }),
    ]).toEqual([
      { colSpan: 1, row: 0, column: 0 },
      { colSpan: 1, row: 0, column: 1 },
      { colSpan: 1, row: 2, column: 0 },
    ]);
  });

  it('lets a wide card take its full requested span on the fresh row after fullRowBefore', () => {
    const builder = createPlacementBuilder(opts);
    // Without fullRowBefore, the wide card at col=2 would clamp to 2.
    // With fullRowBefore the col resets to 0 so the full span 4 lands.
    builder.next(makePostItem(makePost()));
    builder.next(makePostItem(makePost()));
    const placement = builder.next(
      makePostItem(makePost({ significance: 'breaking' })),
      { fullRowBefore: true },
    );
    expect(placement).toEqual({ colSpan: 4, row: 2, column: 0 });
  });

  it('clamps colSpan via maxColSpan option', () => {
    const builder = createPlacementBuilder(opts);
    const placement = builder.next(
      makePostItem(makePost({ significance: 'breaking' })),
      { maxColSpan: 2 },
    );
    expect(placement.colSpan).toBe(2);
  });

  it('stacks maxColSpan with the end-of-row clamp', () => {
    const builder = createPlacementBuilder(opts);
    // Fill cols 0 & 1 so remainingInRow = 2.
    builder.next(makePostItem(makePost()));
    builder.next(makePostItem(makePost()));
    const placement = builder.next(
      makePostItem(makePost({ significance: 'breaking' })),
      { maxColSpan: 1 },
    );
    // min(requested=4, numCards=4, remainingInRow=2, maxColSpan=1) = 1.
    expect(placement.colSpan).toBe(1);
  });

  it('never collapses colSpan below 1 even when maxColSpan is 0', () => {
    const builder = createPlacementBuilder(opts);
    const placement = builder.next(
      makePostItem(makePost({ significance: 'breaking' })),
      { maxColSpan: 0 },
    );
    expect(placement.colSpan).toBe(1);
  });

  it('does not apply maxColSpan to 1-cell items (no-op floor)', () => {
    const builder = createPlacementBuilder(opts);
    const placement = builder.next(makePostItem(makePost()), {
      maxColSpan: 0,
    });
    expect(placement.colSpan).toBe(1);
  });
});

describe('computePlacements', () => {
  const opts = {
    numCards: 4,
    isMobile: false,
    isList: false,
    isEnabled: true,
    minSpacing: 10,
    startIndex: 0,
  };

  const colSpans = (items: FeedItem[], o = opts) =>
    computePlacements(items, o).map((p) => p.colSpan);

  it('returns all 1s with naive row/col when feature is disabled', () => {
    const items = Array.from({ length: 5 }, () =>
      makePostItem(makePost({ significance: 'breaking' })),
    );
    expect(computePlacements(items, { ...opts, isEnabled: false })).toEqual([
      { colSpan: 1, row: 0, column: 0 },
      { colSpan: 1, row: 0, column: 1 },
      { colSpan: 1, row: 0, column: 2 },
      { colSpan: 1, row: 0, column: 3 },
      { colSpan: 1, row: 1, column: 0 },
    ]);
  });

  it('returns all 1s when isMobile', () => {
    const items = Array.from({ length: 3 }, () =>
      makePostItem(makePost({ significance: 'breaking' })),
    );
    expect(colSpans(items, { ...opts, isMobile: true })).toEqual([1, 1, 1]);
  });

  it('returns all 1s when isList', () => {
    const items = Array.from({ length: 3 }, () =>
      makePostItem(makePost({ significance: 'breaking' })),
    );
    expect(colSpans(items, { ...opts, isList: true })).toEqual([1, 1, 1]);
  });

  it('returns all 1s when numCards <= 1', () => {
    const items = [makePostItem(makePost({ significance: 'breaking' }))];
    expect(colSpans(items, { ...opts, numCards: 1 })).toEqual([1]);
  });

  it('renders a wide card at requested size at the start of a row', () => {
    const items = [
      makePostItem(makePost({ significance: 'major' })),
      makePostItem(makePost()),
      makePostItem(makePost()),
    ];
    expect(colSpans(items, opts)).toEqual([3, 1, 1]);
  });

  it('shrinks a wide card that cannot fit the rest of the row', () => {
    const items = [
      makePostItem(makePost()),
      makePostItem(makePost()),
      makePostItem(makePost()),
      makePostItem(makePost({ significance: 'breaking' })),
      makePostItem(makePost()),
    ];
    expect(colSpans(items, opts)).toEqual([1, 1, 1, 1, 1]);
  });

  it('handles a chain of wide items', () => {
    const items = [
      makePostItem(makePost()),
      makePostItem(makePost()),
      makePostItem(makePost()),
      makePostItem(makePost({ significance: 'major' })),
      makePostItem(makePost({ significance: 'breaking' })),
    ];
    expect(colSpans(items, opts)).toEqual([1, 1, 1, 1, 4]);
  });

  it('clamps to numCards when the requested span exceeds available columns', () => {
    const items = [makePostItem(makePost({ significance: 'breaking' }))];
    expect(colSpans(items, { ...opts, numCards: 2 })).toEqual([2]);
    expect(colSpans(items, { ...opts, numCards: 3 })).toEqual([3]);
  });

  it('does not widen ads regardless of position', () => {
    const items = [makeAdItem()];
    expect(colSpans(items, opts)).toEqual([1]);
  });

  it('forces colSpan 1 for items before startIndex', () => {
    const items = [
      makePostItem(makePost({ significance: 'breaking' })),
      makePostItem(makePost({ significance: 'breaking' })),
      makePostItem(makePost({ significance: 'breaking' })),
      makePostItem(makePost({ significance: 'breaking' })),
      makePostItem(makePost({ significance: 'breaking' })),
    ];
    expect(colSpans(items, { ...opts, startIndex: 4 })).toEqual([
      1, 1, 1, 1, 4,
    ]);
  });

  it('caps wide cards to one per ten items', () => {
    const items = [
      makePostItem(makePost({ significance: 'notable' })),
      makePostItem(makePost()),
      makePostItem(makePost()),
      makePostItem(makePost()),
      makePostItem(makePost({ significance: 'notable' })),
    ];
    expect(colSpans(items, opts)).toEqual([2, 1, 1, 1, 1]);
  });

  it('allows another wide card after the density window rolls over', () => {
    const items = [
      ...Array.from({ length: 10 }, () => makePostItem(makePost())),
      makePostItem(makePost({ significance: 'notable' })),
    ];
    expect(colSpans(items, opts)[10]).toBe(2);
  });

  it('does not consume density budget when a wide card shrinks to 1', () => {
    const items = [
      makePostItem(makePost()),
      makePostItem(makePost()),
      makePostItem(makePost()),
      makePostItem(makePost({ significance: 'notable' })),
      makePostItem(makePost({ significance: 'notable' })),
    ];
    expect(colSpans(items, opts)).toEqual([1, 1, 1, 1, 2]);
  });

  describe('row / column tracking', () => {
    it('tracks visual row and column for 1x1 items', () => {
      const items = Array.from({ length: 6 }, () => makePostItem(makePost()));
      expect(computePlacements(items, opts)).toEqual([
        { colSpan: 1, row: 0, column: 0 },
        { colSpan: 1, row: 0, column: 1 },
        { colSpan: 1, row: 0, column: 2 },
        { colSpan: 1, row: 0, column: 3 },
        { colSpan: 1, row: 1, column: 0 },
        { colSpan: 1, row: 1, column: 1 },
      ]);
    });

    it('advances column by the actual span of a wide card', () => {
      const items = [
        makePostItem(makePost({ significance: 'breaking' })),
        makePostItem(makePost()),
        makePostItem(makePost()),
        makePostItem(makePost()),
        makePostItem(makePost()),
      ];
      // 4x1 fills row 0; subsequent 1x1 items start at row 1.
      expect(computePlacements(items, opts)).toEqual([
        { colSpan: 4, row: 0, column: 0 },
        { colSpan: 1, row: 1, column: 0 },
        { colSpan: 1, row: 1, column: 1 },
        { colSpan: 1, row: 1, column: 2 },
        { colSpan: 1, row: 1, column: 3 },
      ]);
    });

    it('tracks placement after a wide card that lands mid-row', () => {
      const items = [
        makePostItem(makePost()),
        makePostItem(makePost({ significance: 'notable' })),
        makePostItem(makePost()),
        makePostItem(makePost()),
      ];
      // 1x1 at (0,0); notable spans 2 at (0,1); next 1x1 fills (0,3); next 1x1 starts (1,0).
      expect(computePlacements(items, opts)).toEqual([
        { colSpan: 1, row: 0, column: 0 },
        { colSpan: 2, row: 0, column: 1 },
        { colSpan: 1, row: 0, column: 3 },
        { colSpan: 1, row: 1, column: 0 },
      ]);
    });

    it('tracks placements when two wide cards both render across density windows', () => {
      // First notable widens at row 0 col 0 (span 2).
      // 11 small posts fill until the second notable lands at row 3 col 1,
      // where there is room for another span-2 card. The density cap allows
      // a second large by index 10+ (windowIndex 1, expected 2, placed 1).
      const items = [
        makePostItem(makePost({ significance: 'notable' })),
        ...Array.from({ length: 11 }, () => makePostItem(makePost())),
        makePostItem(makePost({ significance: 'notable' })),
      ];
      const placements = computePlacements(items, opts);

      // Both wide cards rendered at their requested span.
      expect(placements[0]).toEqual({ colSpan: 2, row: 0, column: 0 });
      expect(placements[12]).toEqual({ colSpan: 2, row: 3, column: 1 });

      // Spot-check items between and immediately around the wide cards
      // so the row/column advance for analytics stays correct.
      expect(placements[1]).toEqual({ colSpan: 1, row: 0, column: 2 });
      expect(placements[2]).toEqual({ colSpan: 1, row: 0, column: 3 });
      expect(placements[3]).toEqual({ colSpan: 1, row: 1, column: 0 });
    });

    it('skips the partial-row tail and banner row at a full-row insertion', () => {
      const items = [
        makePostItem(makePost()),
        makePostItem(makePost()),
        makePostItem(makePost()),
      ];
      // Banner inserts before index 2: items 0,1 fill cols 0,1 of row 0;
      // row 0 tail (cols 2,3) is empty; banner consumes row 1; item 2 lands
      // at (2,0).
      expect(
        computePlacements(items, {
          ...opts,
          fullRowInsertionBeforeIndex: new Set([2]),
        }),
      ).toEqual([
        { colSpan: 1, row: 0, column: 0 },
        { colSpan: 1, row: 0, column: 1 },
        { colSpan: 1, row: 2, column: 0 },
      ]);
    });

    it('does not skip a partial-row tail when the banner appears at column 0', () => {
      const items = [
        makePostItem(makePost()),
        makePostItem(makePost()),
        makePostItem(makePost()),
        makePostItem(makePost()),
        makePostItem(makePost()),
      ];
      // Items 0..3 fill row 0 at cols 0..3; banner before index 4 lands at
      // (1,0); item 4 lands at (2,0).
      expect(
        computePlacements(items, {
          ...opts,
          fullRowInsertionBeforeIndex: new Set([4]),
        }),
      ).toEqual([
        { colSpan: 1, row: 0, column: 0 },
        { colSpan: 1, row: 0, column: 1 },
        { colSpan: 1, row: 0, column: 2 },
        { colSpan: 1, row: 0, column: 3 },
        { colSpan: 1, row: 2, column: 0 },
      ]);
    });
  });

  describe('ad-cadence aware clamp', () => {
    it('shrinks a wide card that would straddle the next ad slot', () => {
      // adStart=4, adRepeat=8 → slots at vcs 4, 12, 20...
      // First 3 normals fill vcs 0-3. The size-4 "breaking" would jump
      // vcs from 3 to 7 (skipping slot at vcs=4). Clamped to 1 so vcs
      // lands at 4 exactly.
      const items = [
        makePostItem(makePost()),
        makePostItem(makePost()),
        makePostItem(makePost()),
        makePostItem(makePost({ significance: 'breaking' })),
      ];
      const placements = computePlacements(items, {
        ...opts,
        adStart: 4,
        adRepeat: 8,
      });
      expect(placements[3].colSpan).toBe(1);
    });

    it('lets a wide card take full span after an ad slot has fired', () => {
      // First two normals fill cols 0-1 (vcs=2). Ad item at index 2
      // takes col 2 (vcs=3). Next wide (size 4) at col 3 still clamps
      // to 1 by row-fit, but the next ad slot has shifted to vcs=12 so
      // ad-clamp is non-restrictive (12-3=9 > 4).
      const items = [
        makePostItem(makePost()),
        makePostItem(makePost()),
        makeAdItem(),
        makePostItem(makePost({ significance: 'breaking' })),
      ];
      const placements = computePlacements(items, {
        ...opts,
        adStart: 2,
        adRepeat: 10,
      });
      // Wide card at col=3 — row-fit clamps to 1, not ad-clamp.
      expect(placements[3]).toEqual({ colSpan: 1, row: 0, column: 3 });
    });

    it('treats ad-page placeholders as filled slots (same as real ads)', () => {
      // Placeholder with `index` (ad loading) consumes 1 visual cell just
      // like a real ad. Wide card after still lands past the slot.
      const placeholderAd = {
        type: FeedItemType.Placeholder,
        index: 0,
      } as FeedItem;
      const items = [
        makePostItem(makePost()),
        makePostItem(makePost()),
        placeholderAd,
        makePostItem(makePost({ significance: 'breaking' })),
        makePostItem(makePost()),
      ];
      const placements = computePlacements(items, {
        ...opts,
        adStart: 2,
        adRepeat: 10,
      });
      // After placeholder ad, vcs=3 → nextAdVcs=12. wide is at col=3,
      // allowed up to min(grid=4, row=1, ad=9) = 1 due to row-fit clamp.
      expect(placements[3]).toEqual({ colSpan: 1, row: 0, column: 3 });
    });

    it('skips ad-clamp logic when adStart/adRepeat are omitted', () => {
      // Same straddle setup as the first test, but with no cadence info
      // → builder behaves as before (no clamp), wide card lands at its
      // requested span (clamped only by row-fit).
      const items = [
        makePostItem(makePost()),
        makePostItem(makePost()),
        makePostItem(makePost()),
        makePostItem(makePost({ significance: 'breaking' })),
      ];
      const placements = computePlacements(items, opts);
      // col=3 at that point → row-fit clamps to 1 (numCards=4 - col=3).
      expect(placements[3].colSpan).toBe(1);
    });

    it('lets wide card span fully when first ad has not yet fired and it fits', () => {
      // adStart=10, adRepeat=10 → first slot at vcs=10. A size-4 at col=0
      // fits comfortably (vcs goes 0→4, well shy of 10).
      const items = [makePostItem(makePost({ significance: 'breaking' }))];
      const placements = computePlacements(items, {
        ...opts,
        adStart: 10,
        adRepeat: 10,
      });
      expect(placements[0].colSpan).toBe(4);
    });

    it('clamps wide card right before the very first ad slot', () => {
      // adStart=3, adRepeat=8. Two normals fill vcs 0-1. Wide at vcs=2
      // requested 4 would jump to vcs=6, skipping slot at vcs=3.
      // Clamped to 1 so vcs lands at 3.
      const items = [
        makePostItem(makePost()),
        makePostItem(makePost()),
        makePostItem(makePost({ significance: 'breaking' })),
      ];
      const placements = computePlacements(items, {
        ...opts,
        adStart: 3,
        adRepeat: 8,
      });
      expect(placements[2].colSpan).toBe(1);
    });

    it('does not suppress wide cards when the first ad slot is missing from items', () => {
      // adStart=4, adRepeat=8. First slot is "skipped" — no ad item lives
      // at vcs=4 in the items array (this mirrors useFeed swapping the
      // first ad for a marketing CTA / plus entry). vcs walks past slot 0
      // via post items alone. A wide card at vcs=4 must still get its
      // full span: the next slot is at vcs=12, so allowance is 8.
      const items = [
        makePostItem(makePost()),
        makePostItem(makePost()),
        makePostItem(makePost()),
        makePostItem(makePost()),
        makePostItem(makePost({ significance: 'breaking' })),
      ];
      const placements = computePlacements(items, {
        ...opts,
        adStart: 4,
        adRepeat: 8,
      });
      // Pre-fix: would clamp to 1 (nextAdVcs stuck at adStart=4 with
      // adsFired=0 and vcs=4). Post-fix: formula derives slotsPassed=1
      // from vcs, nextAdVcs=12, full span allowed.
      expect(placements[4].colSpan).toBe(4);
    });
  });
});
