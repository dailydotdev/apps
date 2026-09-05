import type { FeedItemData } from '../../graphql/feed';
import type { Post } from '../../graphql/posts';
import { withMockFeedHighlights } from './mockFeedHighlights';

jest.mock('../../lib/constants', () => ({
  ...(jest.requireActual('../../lib/constants') as Record<string, unknown>),
  isDevelopment: true,
}));

const mockConstants = jest.requireMock('../../lib/constants') as {
  isDevelopment: boolean;
};

const postNode = (id: string) => ({
  node: {
    itemType: 'post' as const,
    post: { id, commentsPermalink: `https://daily.dev/posts/${id}` } as Post,
    feedMeta: null,
  },
});

const pages = (): FeedItemData[] => [
  {
    page: {
      pageInfo: { hasNextPage: false, endCursor: '' },
      edges: [postNode('p1'), postNode('p2'), postNode('p3')],
    },
  },
];

const itemTypes = (data: FeedItemData[]): string[] =>
  data[0].page.edges.map(({ node }) => node.itemType);

beforeEach(() => {
  mockConstants.isDevelopment = true;
});

it('should leave the feed alone unless it was asked', () => {
  const data = pages();

  expect(withMockFeedHighlights(data, false)).toBe(data);
});

it('should never inject outside development, whatever the query says', () => {
  mockConstants.isDevelopment = false;
  const data = pages();

  expect(withMockFeedHighlights(data, true)).toBe(data);
});

it('should insert one card into the first page', () => {
  const data = withMockFeedHighlights(pages(), true);

  expect(itemTypes(data)).toEqual(['post', 'post', 'highlight', 'post']);
});

it('should point the rows at real posts so they link somewhere', () => {
  const data = withMockFeedHighlights(pages(), true);
  const [{ node }] = data[0].page.edges.filter(
    ({ node: item }) => item.itemType === 'highlight',
  );

  expect(node.itemType === 'highlight' && node.highlights.length).toBeTruthy();
  expect(
    node.itemType === 'highlight' &&
      node.highlights.every(({ post }) => !!post.commentsPermalink),
  ).toBe(true);
});

it('should keep out of the way when the API sent real highlights', () => {
  const data: FeedItemData[] = [
    {
      page: {
        pageInfo: { hasNextPage: false, endCursor: '' },
        edges: [
          postNode('p1'),
          {
            node: {
              itemType: 'highlight' as const,
              highlights: [],
              feedMeta: null,
            },
          },
        ],
      },
    },
  ];

  expect(withMockFeedHighlights(data, true)).toBe(data);
});

it('should not inject into a page with no posts to link to', () => {
  const data: FeedItemData[] = [
    {
      page: {
        pageInfo: { hasNextPage: false, endCursor: '' },
        edges: [],
      },
    },
  ];

  expect(withMockFeedHighlights(data, true)).toBe(data);
});
