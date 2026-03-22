import { gql } from 'graphql-request';

export interface PostHighlight {
  channel: string;
  headline: string;
  createdAt: string;
  updatedAt: string;
  highlightedAt: string;
  post: {
    id: string;
    commentsPermalink: string;
    createdAt: string;
  };
}

export const POST_HIGHLIGHTS_QUERY = gql`
  query PostHighlights($channel: String!) {
    postHighlights(channel: $channel) {
      channel
      headline
      createdAt
      highlightedAt
      post {
        id
        commentsPermalink
        createdAt
      }
    }
  }
`;
