import defaultFeedPage from '../../__tests__/fixture/feed';
import { FEED_V2_QUERY, normalizeFeedPage } from './feed';

describe('normalizeFeedPage', () => {
  it('should keep feedV2 query parity for post HTML content', () => {
    expect(FEED_V2_QUERY).toContain('contentHtml');
  });

  it('should normalize legacy post connections into post feed items', () => {
    const result = normalizeFeedPage({
      page: defaultFeedPage,
    });

    expect(result.page.edges[0].node).toMatchObject({
      itemType: 'post',
      post: defaultFeedPage.edges[0].node,
    });
  });

  it('should normalize feedV2 post items into post feed items', () => {
    const result = normalizeFeedPage({
      page: {
        pageInfo: defaultFeedPage.pageInfo,
        edges: defaultFeedPage.edges.map((edge) => ({
          node: {
            __typename: 'FeedPostItem' as const,
            post: edge.node,
            feedMeta: 'feed-meta',
          },
        })),
      },
    });

    expect(result.page.edges[0].node).toMatchObject({
      itemType: 'post',
      feedMeta: 'feed-meta',
      post: {
        ...defaultFeedPage.edges[0].node,
        feedMeta: 'feed-meta',
      },
    });
  });

  it('should warn and skip unsupported feedV2 item types', () => {
    const warn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    const result = normalizeFeedPage({
      page: {
        pageInfo: defaultFeedPage.pageInfo,
        edges: [
          {
            node: {
              __typename: 'FeedHighlightsItem' as const,
              highlights: [],
              feedMeta: null,
            },
          },
          {
            node: {
              __typename: 'FeedPostItem' as const,
              post: defaultFeedPage.edges[0].node,
              feedMeta: 'feed-meta',
            },
          },
        ],
      },
    });

    expect(warn).toHaveBeenCalledWith(
      'Skipping unsupported feed item type: FeedHighlightsItem',
    );
    expect(result.page.edges).toHaveLength(1);
    expect(result.page.edges[0].node).toMatchObject({
      itemType: 'post',
      feedMeta: 'feed-meta',
      post: {
        ...defaultFeedPage.edges[0].node,
        feedMeta: 'feed-meta',
      },
    });
  });

  it('should keep normalized feed item data unchanged', () => {
    const data = {
      page: {
        pageInfo: defaultFeedPage.pageInfo,
        edges: [
          {
            node: {
              itemType: 'post' as const,
              feedMeta: null,
              post: defaultFeedPage.edges[0].node,
            },
          },
        ],
      },
    };

    expect(normalizeFeedPage(data)).toEqual(data);
  });

  it('should warn and skip malformed normalized feed items', () => {
    const warn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const malformedData = {
      page: {
        pageInfo: defaultFeedPage.pageInfo,
        edges: [
          {
            node: {
              itemType: 'post' as const,
              feedMeta: null,
            },
          },
          {
            node: {
              itemType: 'post' as const,
              feedMeta: null,
              post: defaultFeedPage.edges[0].node,
            },
          },
        ],
      },
    } as Parameters<typeof normalizeFeedPage>[0];

    const result = normalizeFeedPage(malformedData);

    expect(warn).toHaveBeenCalledWith(
      'Skipping malformed feed item type: post',
    );
    expect(result.page.edges).toHaveLength(1);
    expect(result.page.edges[0].node).toMatchObject({
      itemType: 'post',
      post: defaultFeedPage.edges[0].node,
    });
  });
});
