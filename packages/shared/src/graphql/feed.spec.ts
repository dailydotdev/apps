import defaultFeedPage from '../../__tests__/fixture/feed';
import {
  FEED_V2_QUERY,
  normalizeFeedPage,
  type FeedItemData,
  type FeedV2Data,
} from './feed';

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
            __typename: 'FeedPostItem',
            post: edge.node,
            feedMeta: 'feed-meta',
          },
        })),
      },
    } as FeedV2Data);

    expect(result.page.edges[0].node).toMatchObject({
      itemType: 'post',
      feedMeta: 'feed-meta',
      post: {
        ...defaultFeedPage.edges[0].node,
        feedMeta: 'feed-meta',
      },
    });
  });

  it('should throw when feedV2 returns unsupported item types', () => {
    const run = () =>
      normalizeFeedPage({
        page: {
          pageInfo: defaultFeedPage.pageInfo,
          edges: [
            {
              node: {
                __typename: 'FeedHighlightsItem',
                highlights: [],
                feedMeta: null,
              },
            },
          ],
        } as FeedV2Data['page'],
      } as FeedV2Data);

    expect(run).toThrow('Unsupported feed item type: FeedHighlightsItem');
  });

  it('should keep normalized feed item data unchanged', () => {
    const data: FeedItemData = {
      page: {
        pageInfo: defaultFeedPage.pageInfo,
        edges: [
          {
            node: {
              itemType: 'post',
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
