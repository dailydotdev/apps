import type { FeedApiItem, FeedItemData } from '../../graphql/feed';
import { isFeedApiPostItem } from '../../graphql/feed';
import type { PostHighlight } from '../../graphql/highlights';
import { isDevelopment } from '../../lib/constants';

/**
 * TEMPORARY, development only. The Happening Now card comes from the feed API,
 * which returns no highlight items for a local session, so there is nothing to
 * watch the sponsor-strip experiment take away. This injects one card into the
 * first page so both sides of the experiment can be seen locally: with the
 * strip on the card should be gone, with it off it should be back.
 *
 * Opt in with `?mockHighlights=1`. Delete this module and its call in
 * `useFeed` once the experiment is decided.
 */

const MOCK_HEADLINES = [
  'Postgres 18 ships async I/O',
  'Rust in the Linux kernel: one year on',
  'The quiet death of the REST client',
  'We deleted our CI cache and got faster',
];

/** Far enough in to sit in the feed proper rather than the first row. */
const INSERT_AT = 2;

const buildMockHighlights = (
  page: FeedItemData['page'],
): PostHighlight[] | null => {
  const posts = page.edges
    .map(({ node }) => node)
    .filter(isFeedApiPostItem)
    .map(({ post }) => post);

  // Real posts, so the rows link somewhere and the card is worth clicking.
  if (!posts.length) {
    return null;
  }

  return MOCK_HEADLINES.map((headline, index) => {
    const post = posts[index % posts.length];

    return {
      id: `mock-highlight-${index}`,
      channel: 'agents',
      headline,
      highlightedAt: new Date(Date.now() - index * 45 * 60_000).toISOString(),
      post: {
        id: post.id,
        commentsPermalink: post.commentsPermalink,
      },
    };
  });
};

/**
 * The same fixture headlines as a bare list, for the sponsor strip's ticker
 * row — which has the same problem for the same reason. Returns nothing
 * outside development, whatever the query param says.
 */
export const mockStripHeadlines = (enabled: boolean): PostHighlight[] => {
  if (!enabled || !isDevelopment) {
    return [];
  }

  return MOCK_HEADLINES.map((headline, index) => ({
    id: `mock-headline-${index}`,
    channel: 'agents',
    headline,
    highlightedAt: new Date(Date.now() - index * 45 * 60_000).toISOString(),
    post: { id: `mock-post-${index}`, commentsPermalink: '' },
  }));
};

export const withMockFeedHighlights = (
  pages: FeedItemData[],
  enabled: boolean,
): FeedItemData[] => {
  // The environment check is here rather than at the call site so no query
  // param can put a fixture in front of a real reader.
  if (!enabled || !isDevelopment || !pages.length) {
    return pages;
  }

  const [first, ...rest] = pages;

  if (first.page.edges.some(({ node }) => node.itemType === 'highlight')) {
    return pages;
  }

  const highlights = buildMockHighlights(first.page);

  if (!highlights) {
    return pages;
  }

  const node: FeedApiItem = {
    itemType: 'highlight',
    highlights,
    feedMeta: null,
  };
  const edges = [...first.page.edges];
  edges.splice(Math.min(INSERT_AT, edges.length), 0, { node });

  return [{ ...first, page: { ...first.page, edges } }, ...rest];
};
