import { gql } from 'graphql-request';
import { gqlClient } from './common';
import { FIVE_MINUTES } from '../lib/time';

export type StatuslineItemKind = 'HEADLINE' | 'POST';

export interface StatuslineItem {
  /** Highlight id for a HEADLINE, post id for a POST. Stable to key a list on. */
  id: string;
  kind: StatuslineItemKind;
  postId: string;
  title: string;
  upvotes: number;
  permalink: string;
  /** Set only on headlines — a popular post has no editorial timestamp. */
  highlightedAt: string | null;
}

export interface StatuslineFeedData {
  statuslineFeed: StatuslineItem[];
}

export const STATUSLINE_FEED_QUERY = gql`
  query StatuslineFeed($first: Int) {
    statuslineFeed(first: $first) {
      id
      kind
      postId
      title
      upvotes
      permalink
      highlightedAt
    }
  }
`;

/** The same mix the Claude Code statusline renders, off one shared resolver. */
export const statuslineFeedQueryOptions = ({
  first,
}: {
  first?: number;
} = {}) => ({
  queryKey: ['statusline-feed', first ?? 0],
  queryFn: () =>
    gqlClient.request<StatuslineFeedData>(STATUSLINE_FEED_QUERY, { first }),
  staleTime: FIVE_MINUTES,
});
