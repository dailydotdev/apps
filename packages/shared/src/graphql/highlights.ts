import { gql } from 'graphql-request';

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
