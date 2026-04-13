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
    commentsPermalink: string;
    summary?: string;
    contentHtml?: string;
  };
}

export interface MajorHeadlinesData {
  majorHeadlines: Connection<PostHighlight>;
}

const ONE_MINUTE = 60 * 1000;

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
      commentsPermalink
      summary
      contentHtml
    }
  }
`;

export interface PostHighlightsFeedData {
  postHighlights: PostHighlightFeed[];
}

export const POST_HIGHLIGHTS_FEED_QUERY = gql`
  query PostHighlightsFeed($channel: String!) {
    postHighlights(channel: $channel) {
      ...PostHighlightFeedCard
    }
  }
  ${POST_HIGHLIGHT_FEED_FRAGMENT}
`;

export interface ChannelConfiguration {
  channel: string;
  displayName: string;
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
    }
  }
  ${POST_HIGHLIGHT_FEED_FRAGMENT}
`;
