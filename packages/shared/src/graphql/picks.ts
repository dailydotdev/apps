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

export type PicksSuggestionReason =
  | 'upvoted'
  | 'bookmarked'
  | 'read'
  // filled in for a viewer with little history of their own
  | 'from_picks'
  | 'popular';

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

/** The week's distinct posts by strongest signal, as the API attributes them */
/** A post from the reader's week, enough for a thumbnail. */
export type PicksWeekPost = Pick<PicksPost, 'id' | 'image'>;

export interface PicksWeekSignals {
  upvotes: number;
  bookmarks: number;
  reads: number;
  /** Up to three of the week's posts, strongest signal first. */
  posts: PicksWeekPost[];
}

export const PICKS_WEEK_SIGNALS_QUERY = gql`
  query PicksWeekSignals {
    myPicksWeekSignals {
      upvotes
      bookmarks
      reads
      posts {
        id
        image
      }
    }
  }
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
  query PicksSuggestions($fromPicksId: ID) {
    picksSuggestions(fromPicksId: $fromPicksId) {
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

export const PICKS_VIEW_COUNT_QUERY = gql`
  query PicksViewCount($id: ID!) {
    picks(id: $id) {
      id
      viewCount
    }
  }
`;

export const TRACK_PICKS_VIEW_MUTATION = gql`
  mutation TrackPicksView($id: ID!) {
    trackPicksView(id: $id) {
      _
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

export interface NewPicksParams {
  origin?: string;
  /** The picks page the user came from; fills an empty picker */
  from?: string;
  /** A post from that page to preselect */
  add?: string;
}

export const getNewPicksPath = (params: NewPicksParams = {}): string => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });
  const queryString = query.toString();

  return `/picks/new${queryString ? `?${queryString}` : ''}`;
};

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

export const picksWeekSignalsQueryOptions = (
  user?: Pick<LoggedUser, 'id'>,
) => ({
  queryKey: generateQueryKey(RequestKey.Picks, user, 'week-signals'),
  queryFn: async (): Promise<PicksWeekSignals> => {
    const data = await gqlClient.request<{
      myPicksWeekSignals: PicksWeekSignals;
    }>(PICKS_WEEK_SIGNALS_QUERY);
    return data.myPicksWeekSignals;
  },
  enabled: !!user?.id,
});

export const picksSuggestionsQueryOptions = (
  user?: Pick<LoggedUser, 'id'>,
  fromPicksId?: string,
) => ({
  queryKey: generateQueryKey(
    RequestKey.Picks,
    user,
    'suggestions',
    fromPicksId ?? null,
  ),
  queryFn: async (): Promise<PicksSuggestion[]> => {
    const data = await gqlClient.request<{
      picksSuggestions: PicksSuggestion[];
    }>(PICKS_SUGGESTIONS_QUERY, fromPicksId ? { fromPicksId } : undefined);
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

/**
 * The author's own count of unique opens, read on its own: the page itself
 * is fetched on the server without cookies and cached, so it can never
 * carry an author-only field.
 */
export const picksViewCountQueryOptions = (
  id: string,
  user?: Pick<LoggedUser, 'id'>,
) => ({
  queryKey: generateQueryKey(RequestKey.Picks, user, id, 'viewCount'),
  queryFn: async (): Promise<number | null> => {
    const data = await gqlClient.request<{
      picks: { viewCount: number | null } | null;
    }>(PICKS_VIEW_COUNT_QUERY, { id });
    return data.picks?.viewCount ?? null;
  },
  staleTime: 0,
});

/** Counts the viewer once per list on the API; the author is never counted. */
export const trackPicksView = async (id: string): Promise<void> => {
  await gqlClient.request(TRACK_PICKS_VIEW_MUTATION, { id });
};

export const integrationSharePicks = async (variables: {
  integrationId: string;
  channelId: string;
  picksId: string;
  message?: string;
}): Promise<void> => {
  await gqlClient.request(INTEGRATION_SHARE_PICKS_MUTATION, variables);
};
