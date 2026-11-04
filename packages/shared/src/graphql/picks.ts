import { gql } from 'graphql-request';
import { gqlClient } from './common';
import { generateQueryKey, RequestKey } from '../lib/query';
import type { LoggedUser } from '../lib/user';

// Weekly picks: a user picks up to 5 posts they read, upvoted or bookmarked
// this ISO week (Mon–Sun, UTC), adds an optional one-line note per pick and
// shares one link (/picks/:id). One list per user per week; re-entering the
// flow in the same week edits the same list, so the link stays the same.

export const PICKS_MAX_ITEMS = 5;
export const PICKS_NOTE_MAX_LENGTH = 140;
export const PICKS_SUGGESTIONS_MAX = 15;

export type PicksSuggestionReason = 'upvoted' | 'bookmarked' | 'read';

export interface PicksPost {
  id: string;
  title?: string;
  image?: string;
  readTime?: number;
  permalink: string;
  commentsPermalink: string;
  slug?: string;
  type: string;
  source?: { id: string; name: string; image: string; handle: string };
}

export interface PicksSuggestion {
  post: PicksPost;
  reason: PicksSuggestionReason;
  upvoted: boolean;
  bookmarked: boolean;
  read: boolean;
}

export interface PicksItem {
  post: PicksPost;
  note?: string | null;
  position: number;
}

export interface PicksAuthor {
  id: string;
  name: string;
  username: string;
  image: string;
  permalink: string;
}

export interface Picks {
  id: string;
  /** ISO-week Monday as YYYY-MM-DD (UTC) */
  weekStart: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  author: PicksAuthor;
  items: PicksItem[];
}

export interface PicksItemInput {
  postId: string;
  note?: string | null;
}

export interface UpsertPicksResult {
  id: string;
  url: string;
}

const PICKS_POST_FRAGMENT = gql`
  fragment PicksPost on Post {
    id
    title
    image
    readTime
    permalink
    commentsPermalink
    slug
    type
    source {
      id
      name
      image
      handle
    }
  }
`;

const PICKS_FRAGMENT = gql`
  fragment PicksFields on Picks {
    id
    weekStart
    publishedAt
    updatedAt
    author {
      id
      name
      username
      image
      permalink
    }
    items {
      position
      note
      post {
        ...PicksPost
      }
    }
  }
  ${PICKS_POST_FRAGMENT}
`;

export const PICKS_QUERY = gql`
  query Picks($id: ID!) {
    picks(id: $id) {
      ...PicksFields
    }
  }
  ${PICKS_FRAGMENT}
`;

export const MY_CURRENT_PICKS_QUERY = gql`
  query MyCurrentPicks {
    myCurrentPicks {
      ...PicksFields
    }
  }
  ${PICKS_FRAGMENT}
`;

export const PICKS_SUGGESTIONS_QUERY = gql`
  query PicksSuggestions {
    picksSuggestions {
      reason
      upvoted
      bookmarked
      read
      post {
        ...PicksPost
      }
    }
  }
  ${PICKS_POST_FRAGMENT}
`;

export const UPSERT_PICKS_MUTATION = gql`
  mutation UpsertPicks($items: [PicksItemInput!]!) {
    upsertPicks(items: $items) {
      id
      url
    }
  }
`;

export const INTEGRATION_SHARE_PICKS_MUTATION = gql`
  mutation IntegrationSharePicks(
    $integrationId: ID!
    $channelId: ID!
    $picksId: ID!
    $message: String
  ) {
    integrationSharePicks(
      integrationId: $integrationId
      channelId: $channelId
      picksId: $picksId
      message: $message
    ) {
      _
    }
  }
`;

export const getPicksPath = (id: string): string => `/picks/${id}`;

/** Public read, works logged out. Null means the id is unknown. */
export const picksQueryOptions = (id: string) => ({
  queryKey: generateQueryKey(RequestKey.Picks, undefined, id),
  queryFn: async (): Promise<Picks | null> => {
    const data = await gqlClient.request<{ picks: Picks | null }>(PICKS_QUERY, {
      id,
    });
    return data.picks ?? null;
  },
});

export const myCurrentPicksQueryOptions = (user?: Pick<LoggedUser, 'id'>) => ({
  queryKey: generateQueryKey(RequestKey.Picks, user, 'current'),
  queryFn: async (): Promise<Picks | null> => {
    const data = await gqlClient.request<{ myCurrentPicks: Picks | null }>(
      MY_CURRENT_PICKS_QUERY,
    );
    return data.myCurrentPicks ?? null;
  },
  enabled: !!user?.id,
});

export const picksSuggestionsQueryOptions = (
  user?: Pick<LoggedUser, 'id'>,
) => ({
  queryKey: generateQueryKey(RequestKey.Picks, user, 'suggestions'),
  queryFn: async (): Promise<PicksSuggestion[]> => {
    const data = await gqlClient.request<{
      picksSuggestions: PicksSuggestion[];
    }>(PICKS_SUGGESTIONS_QUERY);
    return data.picksSuggestions ?? [];
  },
  enabled: !!user?.id,
});

export const upsertPicks = async (
  items: PicksItemInput[],
): Promise<UpsertPicksResult> => {
  const data = await gqlClient.request<{ upsertPicks: UpsertPicksResult }>(
    UPSERT_PICKS_MUTATION,
    { items },
  );
  return data.upsertPicks;
};

export const integrationSharePicks = async (variables: {
  integrationId: string;
  channelId: string;
  picksId: string;
  message?: string;
}): Promise<void> => {
  await gqlClient.request(INTEGRATION_SHARE_PICKS_MUTATION, variables);
};
