import { gql } from 'graphql-request';

export interface PostHighlight {
  channel: string;
  headline: string;
  highlightedAt: string;
  post: {
    id: string;
    commentsPermalink: string;
    source?: {
      name: string;
      image: string;
    };
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
        source {
          name
          image
        }
      }
    }
  }
`;
