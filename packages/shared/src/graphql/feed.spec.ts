import defaultFeedPage from '../../__tests__/fixture/feed';
import {
  baseFeedSupportedTypes,
  FEED_V2_HIGHLIGHTS_LIMIT,
  FEED_V2_QUERY,
  getFeedV2SupportedTypes,
  normalizeFeedPage,
} from './feed';

describe('normalizeFeedPage', () => {
  it('should keep feedV2 query parity for post HTML content', () => {
    expect(FEED_V2_QUERY).toContain('contentHtml');
  });

  it('should request feedV2 highlights when enabled', () => {
    expect(FEED_V2_QUERY).toContain('$highlightsLimit: Int');
    expect(FEED_V2_QUERY).toContain('highlightsLimit: $highlightsLimit');
    expect(FEED_V2_QUERY).toContain('... on FeedHighlightsItem');
    expect(FEED_V2_QUERY).toContain('...PostHighlightCard');
    expect(FEED_V2_HIGHLIGHTS_LIMIT).toBe(5);
  });

  it('should add highlight to feedV2 supported types only when enabled', () => {
    expect(getFeedV2SupportedTypes(false)).toEqual(baseFeedSupportedTypes);
    expect(getFeedV2SupportedTypes(true)).toEqual([
      ...baseFeedSupportedTypes,
      'highlight',
    ]);
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

  it('should normalize feedV2 highlight items into highlight feed items', () => {
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
              highlights: [
                {
                  id: 'highlight-1',
                  channel: 'agents',
                  headline: 'The first highlight',
                  highlightedAt: '2026-04-05T09:00:00.000Z',
                  post: {
                    id: defaultFeedPage.edges[0].node.id,
                    commentsPermalink:
                      defaultFeedPage.edges[0].node.commentsPermalink,
                  },
                },
              ],
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

    expect(warn).not.toHaveBeenCalled();
    expect(result.page.edges).toHaveLength(2);
    expect(result.page.edges[0].node).toMatchObject({
      itemType: 'highlight',
      feedMeta: null,
      highlights: [
        {
          id: 'highlight-1',
          channel: 'agents',
          headline: 'The first highlight',
          highlightedAt: '2026-04-05T09:00:00.000Z',
          post: {
            id: defaultFeedPage.edges[0].node.id,
            commentsPermalink: defaultFeedPage.edges[0].node.commentsPermalink,
          },
        },
      ],
    });
    expect(result.page.edges[1].node).toMatchObject({
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
});
