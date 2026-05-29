import type { Ad, Post, PostHighlightSignificance } from '../graphql/posts';
import { PostType } from '../graphql/posts';
import type { FeedItem } from '../hooks/useFeed';
import { FeedItemType } from '../components/cards/common/common';
import { computePlacements, requestedColSpan } from './feedHighlightColSpan';

const makePost = (
  overrides: Partial<Post> & {
    significance?: PostHighlightSignificance | null;
  } = {},
): Post => {
  const { significance, ...rest } = overrides;
  return {
    id: rest.id ?? 'p1',
    type: rest.type ?? PostType.Article,
    image: '',
    commentsPermalink: '',
    ...(significance !== undefined && {
      postHighlight: significance
        ? {
            id: 'h1',
            channel: 'vibes',
            highlightedAt: '2026-05-25T00:00:00.000Z',
            headline: 'h',
            significance,
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
  it('returns 1 for items without postHighlight', () => {
    expect(requestedColSpan(makePostItem(makePost()))).toBe(1);
  });

  it.each<[PostHighlightSignificance, number]>([
    ['breaking', 4],
    ['major', 3],
    ['notable', 2],
    ['routine', 1],
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

describe('computePlacements', () => {
  const opts = {
    numCards: 4,
    isMobile: false,
    isList: false,
    isEnabled: true,
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
        makePostItem(makePost({ significance: 'major' })),
        makePostItem(makePost()),
      ];
      // 1x1 at col 0, major(3) at col 1 fills cols 1-3, next 1x1 at row 1.
      expect(computePlacements(items, opts)).toEqual([
        { colSpan: 1, row: 0, column: 0 },
        { colSpan: 3, row: 0, column: 1 },
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
      expect(placements[11]).toEqual({ colSpan: 1, row: 3, column: 0 });
    });

    it('skips the partial-row tail and banner row at a full-row insertion', () => {
      const items = [
        makePostItem(makePost()),
        makePostItem(makePost()),
        makePostItem(makePost()),
      ];
      // Banner inserted before index 2: row 0 cols 2-3 stay empty,
      // banner takes row 1, item 2 starts at row 2 col 0.
      const fullRowInsertionBeforeIndex = new Set<number>([2]);
      expect(
        computePlacements(items, { ...opts, fullRowInsertionBeforeIndex }),
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
      // Banner before index 4: row 0 fills 0-3 exactly, no tail; banner
      // takes row 1, item 4 starts at row 2.
      const fullRowInsertionBeforeIndex = new Set<number>([4]);
      expect(
        computePlacements(items, { ...opts, fullRowInsertionBeforeIndex }),
      ).toEqual([
        { colSpan: 1, row: 0, column: 0 },
        { colSpan: 1, row: 0, column: 1 },
        { colSpan: 1, row: 0, column: 2 },
        { colSpan: 1, row: 0, column: 3 },
        { colSpan: 1, row: 2, column: 0 },
      ]);
    });
  });
});
