import { gql } from 'graphql-request';
import { gqlClient } from './common';
import { ONE_MINUTE } from '../lib/time';

/**
 * Where a statusline item came from: a curated major headline, or a post off
 * the popular feed. Headlines are the only kind with an editorial timestamp.
 */
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

/**
 * The curated-headlines-plus-popular mix the Claude Code statusline renders as
 * terminal lines, as data. One resolver and one cache serve both, so the
 * terminal and the web cannot drift apart on what they are showing.
 */
export const statuslineFeedQueryOptions = ({
  first,
}: {
  first?: number;
} = {}) => ({
  queryKey: ['statusline-feed', first ?? 0],
  queryFn: () =>
    gqlClient.request<StatuslineFeedData>(STATUSLINE_FEED_QUERY, { first }),
  staleTime: ONE_MINUTE,
});
