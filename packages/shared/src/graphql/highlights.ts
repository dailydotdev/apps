import { gql } from 'graphql-request';

export interface PostHighlight {
  channel: string;
  rank: number;
  headline: string;
  createdAt: string;
  updatedAt: string;
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
      rank
      headline
      createdAt
      post {
        id
        commentsPermalink
        createdAt
      }
    }
  }
`;
