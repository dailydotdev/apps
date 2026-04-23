import { gql } from 'graphql-request';
import { CUSTOM_FEED_FRAGMENT, FEED_POST_FRAGMENT } from './fragments';
import { POST_HIGHLIGHT_FRAGMENT, type PostHighlight } from './highlights';
import type { Post } from './posts';
import { PostType } from '../types';
import type { Connection } from './common';
import type { FeedOrder } from '../lib/constants';

export enum RankingAlgorithm {
  Popularity = 'POPULARITY',
  Time = 'TIME',
}

export enum BookmarkSort {
  TimeDesc = 'TIME_DESC',
  TimeAsc = 'TIME_ASC',
}

export const baseFeedSupportedTypes = [
  PostType.Article,
  PostType.Share,
  PostType.Freeform,
  PostType.SocialTwitter,
  PostType.VideoYouTube,
  PostType.Collection,
  PostType.Poll,
];

export const supportedTypesForPrivateSources = [
  ...baseFeedSupportedTypes,
  PostType.Welcome,
];

const joinedTypes = baseFeedSupportedTypes.join('","');
export const SUPPORTED_TYPES = `$supportedTypes: [String!] = ["${joinedTypes}"]`;
export const FEED_V2_HIGHLIGHTS_LIMIT = 4;

export const getFeedV2SupportedTypes = (
  shouldSupportHighlights: boolean,
): string[] =>
  shouldSupportHighlights
    ? [...baseFeedSupportedTypes, 'highlight']
    : [...baseFeedSupportedTypes];

export interface FeedData {
  page: Connection<Post>;
}

export type FeedPostItem = {
  itemType: 'post';
  post: Post;
  feedMeta: string | null;
};

export type FeedHighlightsItem = {
  itemType: 'highlight';
  highlights: PostHighlight[];
  feedMeta: string | null;
};

export type FeedApiItem = FeedPostItem | FeedHighlightsItem;

export interface FeedItemData {
  page: Connection<FeedApiItem>;
}

type FeedV2PostItem = {
  __typename?: 'FeedPostItem';
  post?: Post | null;
  feedMeta?: string | null;
};

type FeedV2HighlightsItem = {
  __typename?: 'FeedHighlightsItem';
  feedMeta?: string | null;
  highlights?: PostHighlight[];
};

export type FeedV2Item = FeedV2PostItem | FeedV2HighlightsItem;

export interface FeedV2Data {
  page: Connection<FeedV2Item>;
}

const getGraphqlTypename = (
  item: FeedV2Item | Post,
): FeedV2Item['__typename'] | Post['__typename'] => {
  const { __typename: typename } = item;

  return typename;
};

const warnUnsupportedFeedItem = (itemType: string): void => {
  // eslint-disable-next-line no-console
  console.warn(`Skipping unsupported feed item type: ${itemType}`);
};

const isFeedV2Typename = (
  typename: FeedV2Item['__typename'] | Post['__typename'],
): typename is FeedV2Item['__typename'] =>
  typename === 'FeedPostItem' || typename === 'FeedHighlightsItem';

export const isFeedApiItem = (
  item: FeedApiItem | FeedV2Item | Post,
): item is FeedApiItem => 'itemType' in item;

export const isFeedApiPostItem = (
  item: FeedApiItem | FeedV2Item | Post,
): item is FeedPostItem => isFeedApiItem(item) && item.itemType === 'post';

export const isFeedApiHighlightItem = (
  item: FeedApiItem | FeedV2Item | Post,
): item is FeedHighlightsItem =>
  isFeedApiItem(item) && item.itemType === 'highlight';

export const isFeedV2Item = (
  item: FeedApiItem | FeedV2Item | Post,
): item is FeedV2Item =>
  '__typename' in item && isFeedV2Typename(getGraphqlTypename(item));

export const isFeedV2PostItem = (
  item: FeedV2Item | Post,
): item is FeedV2PostItem =>
  isFeedV2Item(item) && getGraphqlTypename(item) === 'FeedPostItem';

export const isFeedV2HighlightsItem = (
  item: FeedV2Item | Post,
): item is FeedV2HighlightsItem =>
  isFeedV2Item(item) && getGraphqlTypename(item) === 'FeedHighlightsItem';

export const isLegacyFeedPost = (
  item: FeedApiItem | FeedV2Item | Post,
): item is Post =>
  !isFeedApiItem(item) &&
  (!('__typename' in item) || getGraphqlTypename(item) === 'Post');

export const getFeedApiItemPost = (
  item: FeedApiItem | FeedV2Item | Post,
): Post | null => {
  if (isFeedApiPostItem(item)) {
    return item.post;
  }

  if (isFeedV2PostItem(item)) {
    return item.post ?? null;
  }

  return isLegacyFeedPost(item) ? item : null;
};

const normalizeLegacyFeedEdge = (
  edge: Connection<Post>['edges'][number],
): Connection<FeedApiItem>['edges'][number] => ({
  ...edge,
  node: {
    itemType: 'post',
    feedMeta: edge.node.feedMeta ?? null,
    post: edge.node,
  },
});

const normalizeFeedV2Edge = (
  edge: Connection<FeedV2Item>['edges'][number],
): Connection<FeedApiItem>['edges'][number] | null => {
  const { node } = edge;

  if (isFeedV2PostItem(node)) {
    if (!node.post) {
      throw new Error('feedV2 post item is missing post');
    }

    const feedMeta = node.feedMeta ?? node.post.feedMeta ?? null;

    return {
      ...edge,
      node: {
        itemType: 'post',
        feedMeta,
        post: {
          ...node.post,
          ...(feedMeta ? { feedMeta } : {}),
        },
      },
    };
  }

  if (isFeedV2HighlightsItem(node)) {
    if (!node.highlights?.length) {
      return null;
    }

    return {
      ...edge,
      node: {
        itemType: 'highlight',
        feedMeta: node.feedMeta ?? null,
        highlights: node.highlights,
      },
    };
  }

  warnUnsupportedFeedItem(getGraphqlTypename(node) ?? 'unknown');

  return null;
};

export const normalizeFeedPage = (
  data: FeedData | FeedItemData | FeedV2Data,
): FeedItemData => {
  const firstNode = data.page.edges[0]?.node;

  if (!firstNode) {
    return {
      page: {
        ...data.page,
        edges: [],
      },
    };
  }

  if (isFeedApiItem(firstNode)) {
    return data as FeedItemData;
  }

  if (isFeedV2Item(firstNode)) {
    return {
      page: {
        ...data.page,
        edges: (data as FeedV2Data).page.edges.reduce<
          Connection<FeedApiItem>['edges']
        >((normalizedEdges, edge) => {
          const normalizedEdge = normalizeFeedV2Edge(edge);

          if (normalizedEdge) {
            normalizedEdges.push(normalizedEdge);
          }

          return normalizedEdges;
        }, []),
      },
    };
  }

  if (isLegacyFeedPost(firstNode)) {
    return {
      page: {
        ...data.page,
        edges: (data as FeedData).page.edges.map(normalizeLegacyFeedEdge),
      },
    };
  }

  throw new Error('Unsupported feed page shape');
};

export type FeedFlags = {
  name: string;
  icon?: string;
  orderBy?: FeedOrder;
  minDayRange?: number;
  minUpvotes?: number;
  minViews?: number;
  disableEngagementFilter?: boolean;
};

export enum FeedType {
  Main = 'main',
  Custom = 'custom',
}

export type Feed = {
  id: string;
  userId: string;
  flags?: FeedFlags;
  slug: string;
  createdAt: Date;
  type: FeedType;
};

export type FeedList = {
  feedList: Connection<Feed>;
};

export const USER_POST_FRAGMENT = gql`
  fragment UserPost on Post {
    read
    upvoted
    commented
    bookmarked
    downvoted
  }
`;

const getFeedPostFragment = (fields = '') => gql`
  fragment FeedPostConnection on PostConnection {
    pageInfo {
      hasNextPage
      endCursor
      staleCursor
    }
    edges {
      node {
        ...FeedPost
        ${fields}
        ...UserPost @include(if: $loggedIn)
      }
    }
  }
  ${FEED_POST_FRAGMENT}
  ${USER_POST_FRAGMENT}
`;

export const FEED_POST_CONNECTION_FRAGMENT = getFeedPostFragment('contentHtml');

export const ANONYMOUS_FEED_QUERY = gql`
  query AnonymousFeed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $ranking: Ranking
    $version: Int
    ${SUPPORTED_TYPES}
  ) {
    page: anonymousFeed(
      first: $first
      after: $after
      ranking: $ranking
      version: $version
      supportedTypes: $supportedTypes
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const FEED_QUERY = gql`
  query Feed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $ranking: Ranking
    $version: Int
    ${SUPPORTED_TYPES}
  ) {
    page: feed(
      first: $first
      after: $after
      ranking: $ranking
      version: $version
      supportedTypes: $supportedTypes
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const FEED_V2_QUERY = gql`
  query FeedV2(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $ranking: Ranking
    $version: Int
    $highlightsLimit: Int
    ${SUPPORTED_TYPES}
  ) {
    page: feedV2(
      first: $first
      after: $after
      ranking: $ranking
      version: $version
      highlightsLimit: $highlightsLimit
      supportedTypes: $supportedTypes
    ) {
      pageInfo {
        hasNextPage
        endCursor
        staleCursor
      }
      edges {
        node {
          __typename
          ... on FeedPostItem {
            feedMeta
            post {
              ...FeedPost
              contentHtml
              ...UserPost @include(if: $loggedIn)
            }
          }
          ... on FeedHighlightsItem {
            feedMeta
            highlights {
              ...PostHighlightCard
            }
          }
        }
      }
    }
  }
  ${FEED_POST_FRAGMENT}
  ${USER_POST_FRAGMENT}
  ${POST_HIGHLIGHT_FRAGMENT}
`;

export const MOST_UPVOTED_FEED_QUERY = gql`
  query MostUpvotedFeed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $period: Int
    ${SUPPORTED_TYPES}
    $source: ID
    $tag: String
  ) {
    page: mostUpvotedFeed(first: $first, after: $after, period: $period, supportedTypes: $supportedTypes, source: $source, tag: $tag) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const MOST_DISCUSSED_FEED_QUERY = gql`
  query MostDiscussedFeed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $period: Int
    ${SUPPORTED_TYPES}
    $source: ID
    $tag: String
  ) {
    page: mostDiscussedFeed(first: $first, after: $after, period: $period, supportedTypes: $supportedTypes, source: $source, tag: $tag) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const TAG_FEED_QUERY = gql`
  query TagFeed(
    $tag: String!
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $ranking: Ranking
    ${SUPPORTED_TYPES}
  ) {
    page: tagFeed(tag: $tag, first: $first, after: $after, ranking: $ranking, supportedTypes: $supportedTypes) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const TAG_TOP_POSTS_QUERY = gql`
  query TagTopPosts($tag: String!, $first: Int) {
    page: tagFeed(tag: $tag, first: $first, ranking: POPULARITY) {
      edges {
        node {
          id
          title
          slug
        }
      }
    }
  }
`;

export type TopPost = {
  id: string;
  title?: string;
  slug?: string;
};

export type TopPostsData = {
  page?: {
    edges?: {
      node: TopPost;
    }[];
  };
};

export const SOURCE_TOP_POSTS_QUERY = gql`
  query SourceTopPosts($source: ID!, $first: Int) {
    page: sourceFeed(source: $source, first: $first, ranking: POPULARITY) {
      edges {
        node {
          id
          title
          slug
        }
      }
    }
  }
`;

export const SOURCE_FEED_QUERY = gql`
  query SourceFeed(
    $source: ID!
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $ranking: Ranking
    $supportedTypes: [String!]
  ) {
    page: sourceFeed(
      source: $source
      first: $first
      after: $after
      ranking: $ranking
      supportedTypes: $supportedTypes
    ) {
      ...FeedPostConnection
    }
  }
  ${getFeedPostFragment('pinnedAt contentHtml')}
`;

export const CHANNEL_FEED_QUERY = gql`
  query ChannelFeed(
    $channel: String!
    $contentCuration: [String!]
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $supportedTypes: [String!]
  ) {
    page: channelFeed(
      channel: $channel
      contentCuration: $contentCuration
      first: $first
      after: $after
      supportedTypes: $supportedTypes
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const BOOKMARKS_FEED_QUERY = gql`
  query BookmarksFeed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $listId: ID
    $reminderOnly: Boolean
    $sort: BookmarkSort
    $supportedTypes: [String!]
  ) {
    page: bookmarksFeed(
      first: $first
      after: $after
      listId: $listId
      reminderOnly: $reminderOnly
      sort: $sort
      supportedTypes: $supportedTypes
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const FOLLOWING_FEED_QUERY = gql`
  query FollowingFeed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    ${SUPPORTED_TYPES}
  ) {
    page: followingFeed(
      first: $first
      after: $after
      supportedTypes: $supportedTypes
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const FEED_BY_IDS_QUERY = gql`
  query FeedByIdsFeed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $supportedTypes: [String!]
    $postIds: [String!]!
  ) {
    page: feedByIds(
      first: $first
      after: $after
      supportedTypes: $supportedTypes
      postIds: $postIds
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const SEARCH_BOOKMARKS_QUERY = gql`
  query SearchBookmarks(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $query: String!
    $listId: ID
    $supportedTypes: [String!]
  ) {
    page: searchBookmarks(
      first: $first
      after: $after
      query: $query
      listId: $listId
      supportedTypes: $supportedTypes
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const SEARCH_BOOKMARKS_SUGGESTIONS = gql`
  query SearchBookmarksSuggestions($query: String!) {
    searchBookmarksSuggestions(query: $query) {
      hits {
        title
      }
    }
  }
`;

export const SEARCH_POSTS_QUERY = gql`
  query SearchPosts(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $query: String!
    ${SUPPORTED_TYPES}
    $contentCuration: [String]
    $time: SearchTime
    $version: Int
  ) {
    page: searchPosts(
      first: $first,
      after: $after,
      query: $query,
      supportedTypes: $supportedTypes,
      contentCuration: $contentCuration,
      time: $time,
      version: $version
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const AUTHOR_FEED_QUERY = gql`
  query AuthorFeed(
    $loggedIn: Boolean! = false
    $userId: ID!,
    $after: String,
    $first: Int
    ${SUPPORTED_TYPES}
   ) {
    page: authorFeed(
      author: $userId
      after: $after
      first: $first
      ranking: TIME
      supportedTypes: $supportedTypes
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const USER_UPVOTED_FEED_QUERY = gql`
  query UpvotedFeed(
    $loggedIn: Boolean! = false
    $userId: ID!,
    $after: String,
    $first: Int
  ${SUPPORTED_TYPES}
  ) {
    page: userUpvotedFeed(
      userId: $userId
      after: $after
      first: $first
      ranking: TIME
      supportedTypes: $supportedTypes
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const KEYWORD_FEED_QUERY = gql`
  query KeywordFeed(
    $keyword: String!,
    $after: String,
    $first: Int
    ${SUPPORTED_TYPES}
   ) {
    page: keywordFeed(keyword: $keyword, after: $after, first: $first, supportedTypes: $supportedTypes) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          id
          title
          commentsPermalink
          image
        }
      }
    }
  }
`;

export const PREVIEW_FEED_QUERY = gql`
  query FeedPreview(
    $loggedIn: Boolean! = false
    ${SUPPORTED_TYPES}
    $filters: FiltersInput
  ) {
    page: feedPreview(
      supportedTypes: $supportedTypes
      filters: $filters
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const FEED_LIST_QUERY = gql`
  query FeedList {
    feedList {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          ...CustomFeed
        }
      }
    }
  }
  ${CUSTOM_FEED_FRAGMENT}
`;

export const CUSTOM_FEED_QUERY = gql`
  query CustomFeed(
    $loggedIn: Boolean! = false
    $feedId: ID!
    $after: String
    $first: Int
    ${SUPPORTED_TYPES}
    $version: Int
    $ranking: Ranking
  ) {
    page: customFeed(
      feedId: $feedId
      after: $after
      first: $first
      supportedTypes: $supportedTypes
      version: $version
      ranking: $ranking
    ) {
      ...FeedPostConnection
    }
  }
  ${FEED_POST_CONNECTION_FRAGMENT}
`;

export const CREATE_FEED_MUTATION = `
  mutation CreateFeed($name: String!, $icon: String) {
    createFeed(name: $name, icon: $icon) {
      ...CustomFeed
    }
  }
  ${CUSTOM_FEED_FRAGMENT}
`;

export const UPDATE_FEED_MUTATION = `
  mutation UpdateFeed($feedId: ID!, $name: String!, $icon: String, $orderBy: FeedOrderBy, $minDayRange: Int, $minUpvotes: Int, $minViews: Int, $disableEngagementFilter: Boolean) {
    updateFeed(feedId: $feedId, name: $name, icon: $icon, orderBy: $orderBy, minDayRange: $minDayRange, minUpvotes: $minUpvotes, minViews: $minViews, disableEngagementFilter: $disableEngagementFilter) {
      ...CustomFeed
    }
  }
  ${CUSTOM_FEED_FRAGMENT}
`;

export const DELETE_FEED_MUTATION = `
  mutation DeleteFeed($feedId: ID!) {
    deleteFeed(feedId: $feedId) {
      _
    }
}
`;
