import { gql } from 'graphql-request';
import { gqlClient } from './common';
import type { Connection } from './common';

export interface PostHighlight {
  id: string;
  channel: string;
  headline: string;
  highlightedAt: string;
  post: {
    id: string;
    commentsPermalink: string;
  };
}

export interface PostHighlightFeed {
  id: string;
  channel: string;
  headline: string;
  highlightedAt: string;
  post: {
    id: string;
    type: string;
    commentsPermalink: string;
    summary?: string;
    contentHtml?: string;
    sharedPost?: {
      summary?: string;
      contentHtml?: string;
    };
  };
}

export interface MajorHeadlinesData {
  majorHeadlines: Connection<PostHighlight>;
}

const ONE_MINUTE = 60 * 1000;
export const HIGHLIGHTS_PAGE_QUERY_KEY = ['highlights-page'];

type HighlightIdentity = Pick<PostHighlight, 'id'>;

export const getHighlightIds = (highlights: HighlightIdentity[]): string[] =>
  highlights.map(({ id }) => id);

export const getHighlightIdsKey = (highlights: HighlightIdentity[]): string =>
  getHighlightIds(highlights).join('-');

export const POST_HIGHLIGHT_FRAGMENT = gql`
  fragment PostHighlightCard on PostHighlight {
    id
    channel
    headline
    highlightedAt
    post {
      id
      commentsPermalink
    }
  }
`;

export const POST_HIGHLIGHTS_QUERY = gql`
  query PostHighlights($channel: String!) {
    postHighlights(channel: $channel) {
      ...PostHighlightCard
    }
  }
  ${POST_HIGHLIGHT_FRAGMENT}
`;

export const MAJOR_HEADLINES_QUERY = gql`
  query MajorHeadlines($first: Int, $after: String) {
    majorHeadlines(first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          ...PostHighlightCard
        }
      }
    }
  }
  ${POST_HIGHLIGHT_FRAGMENT}
`;

export const MAJOR_HEADLINES_MAX_FIRST = 50;

export const majorHeadlinesQueryOptions = ({
  first = MAJOR_HEADLINES_MAX_FIRST,
  after,
}: {
  first?: number;
  after?: string;
}) => ({
  queryKey: ['major-headlines', first, after ?? ''],
  queryFn: () =>
    gqlClient.request<MajorHeadlinesData>(MAJOR_HEADLINES_QUERY, {
      first,
      after,
    }),
  staleTime: ONE_MINUTE,
});

export const POST_HIGHLIGHT_FEED_FRAGMENT = gql`
  fragment PostHighlightFeedCard on PostHighlight {
    id
    channel
    headline
    highlightedAt
    post {
      id
      type
      commentsPermalink
      summary
      contentHtml
      sharedPost {
        summary
        contentHtml
      }
    }
  }
`;

export interface PostHighlightsFeedData {
  postHighlights: PostHighlightFeed[];
}

export const getChannelHighlightsFeedQueryKey = (channel: string) => [
  'channel-highlights-feed',
  channel,
];

export const POST_HIGHLIGHTS_FEED_QUERY = gql`
  query PostHighlightsFeed($channel: String!) {
    postHighlights(channel: $channel) {
      ...PostHighlightFeedCard
    }
  }
  ${POST_HIGHLIGHT_FEED_FRAGMENT}
`;

export interface ChannelDigestConfiguration {
  frequency: string;
  source?: {
    id: string;
    name: string;
    image: string;
    handle: string;
    permalink: string;
  };
}

export interface ChannelConfiguration {
  channel: string;
  displayName: string;
  digest?: ChannelDigestConfiguration | null;
}

export interface HighlightsPageData {
  majorHeadlines: Connection<PostHighlightFeed>;
  channelConfigurations: ChannelConfiguration[];
}

export const HIGHLIGHTS_PAGE_QUERY = gql`
  query HighlightsPage($first: Int, $after: String) {
    majorHeadlines(first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          ...PostHighlightFeedCard
        }
      }
    }
    channelConfigurations {
      channel
      displayName
      digest {
        frequency
        source {
          id
          name
          image
          handle
          permalink
        }
      }
    }
  }
  ${POST_HIGHLIGHT_FEED_FRAGMENT}
`;

export const highlightsPageQueryOptions = ({
  first = MAJOR_HEADLINES_MAX_FIRST,
  after,
}: {
  first?: number;
  after?: string;
} = {}) => ({
  queryKey: HIGHLIGHTS_PAGE_QUERY_KEY,
  queryFn: () =>
    gqlClient.request<HighlightsPageData>(HIGHLIGHTS_PAGE_QUERY, {
      first,
      after,
    }),
  staleTime: ONE_MINUTE,
});

export const channelHighlightsFeedQueryOptions = (channel: string) => ({
  queryKey: getChannelHighlightsFeedQueryKey(channel),
  queryFn: () =>
    gqlClient.request<PostHighlightsFeedData>(POST_HIGHLIGHTS_FEED_QUERY, {
      channel,
    }),
  staleTime: ONE_MINUTE,
});
