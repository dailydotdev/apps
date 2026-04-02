import { gql } from 'graphql-request';

export const AGENTS_DIGEST_SOURCE_ID = 'agents_digest';

export interface PostHighlight {
  channel: string;
  headline: string;
  highlightedAt: string;
  post: {
    id: string;
    commentsPermalink: string;
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
