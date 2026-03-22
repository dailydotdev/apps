import { gql } from 'graphql-request';

export interface PostHighlight {
  channel: string;
  headline: string;
  highlightedAt: string;
  post: {
    id: string;
    commentsPermalink: string;
  };
}

export interface PostHighlightEdge {
  cursor: string;
  node: PostHighlight;
}

export interface PostHighlightConnection {
  edges: PostHighlightEdge[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

export const POST_HIGHLIGHTS_QUERY = gql`
  query PostHighlights($channel: String!) {
    postHighlights(channel: $channel) {
      channel
      headline
      highlightedAt
      post {
        id
        commentsPermalink
      }
    }
  }
`;

export const MAJOR_HEADLINES_QUERY = gql`
  query MajorHeadlines($first: Int, $after: String) {
    majorHeadlines(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          channel
          headline
          highlightedAt
          post {
            id
            commentsPermalink
          }
        }
      }
    }
  }
`;
