import type { Ad, Post, PostHighlightSignificance } from '../graphql/posts';
import { PostType } from '../graphql/posts';
import type { FeedItem } from '../hooks/useFeed';
import { FeedItemType } from '../components/cards/common/common';
import { computeColSpans, requestedColSpan } from './feedHighlightColSpan';

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

describe('computeColSpans', () => {
  const opts = {
    numCards: 4,
    isMobile: false,
    isList: false,
  };

  it('returns all 1s when isMobile', () => {
    const items = Array.from({ length: 3 }, () =>
      makePostItem(makePost({ significance: 'breaking' })),
    );
    expect(computeColSpans(items, { ...opts, isMobile: true })).toEqual([
      1, 1, 1,
    ]);
  });

  it('returns all 1s when isList', () => {
    const items = Array.from({ length: 3 }, () =>
      makePostItem(makePost({ significance: 'breaking' })),
    );
    expect(computeColSpans(items, { ...opts, isList: true })).toEqual([
      1, 1, 1,
    ]);
  });

  it('returns all 1s when numCards <= 1', () => {
    const items = [makePostItem(makePost({ significance: 'breaking' }))];
    expect(computeColSpans(items, { ...opts, numCards: 1 })).toEqual([1]);
  });

  it('renders a wide card at requested size at the start of a row', () => {
    const items = [
      makePostItem(makePost({ significance: 'major' })),
      makePostItem(makePost()),
      makePostItem(makePost()),
    ];
    expect(computeColSpans(items, opts)).toEqual([3, 1, 1]);
  });

  it('shrinks a wide card that cannot fit the rest of the row', () => {
    const items = [
      makePostItem(makePost()),
      makePostItem(makePost()),
      makePostItem(makePost()),
      makePostItem(makePost({ significance: 'breaking' })),
      makePostItem(makePost()),
    ];
    expect(computeColSpans(items, opts)).toEqual([1, 1, 1, 1, 1]);
  });

  it('handles a chain of wide items', () => {
    const items = [
      makePostItem(makePost()),
      makePostItem(makePost()),
      makePostItem(makePost()),
      makePostItem(makePost({ significance: 'major' })),
      makePostItem(makePost({ significance: 'breaking' })),
    ];
    expect(computeColSpans(items, opts)).toEqual([1, 1, 1, 1, 4]);
  });

  it('clamps to numCards when the requested span exceeds available columns', () => {
    const items = [makePostItem(makePost({ significance: 'breaking' }))];
    expect(computeColSpans(items, { ...opts, numCards: 2 })).toEqual([2]);
    expect(computeColSpans(items, { ...opts, numCards: 3 })).toEqual([3]);
  });

  it('resets the column tracker at a full-row insertion index', () => {
    const items = [
      makePostItem(makePost()),
      makePostItem(makePost()),
      makePostItem(makePost({ significance: 'major' })),
    ];
    const fullRowInsertionBeforeIndex = new Set<number>([2]);
    expect(
      computeColSpans(items, { ...opts, fullRowInsertionBeforeIndex }),
    ).toEqual([1, 1, 3]);
  });

  it('does not widen ads regardless of position', () => {
    const items = [makeAdItem()];
    expect(computeColSpans(items, opts)).toEqual([1]);
  });
});
