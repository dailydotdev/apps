import type { QueryClient } from '@tanstack/react-query';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import type { LoggedUser } from '../../lib/user';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
  StaleTime,
} from '../../lib/query';
import {
  getLfgAcceptedReachOuts,
  getLfgBoard,
  getLfgBoardFacets,
  getLfgConversation,
  getLfgHelper,
  getLfgHelperSuggestedTags,
  getLfgPerson,
  getLfgPost,
  getLfgReachOut,
  getLfgReachOutInbox,
  getLfgReachOutsLeft,
  getLfgStreak,
  getMyLfgPost,
  getUserLfgPost,
} from './graphql';
import type { LfgBoardFilters, LfgKind, LfgPost } from './types';

type QueryUser = Pick<LoggedUser, 'id'> | undefined;

const lfgKey = (user: QueryUser, ...additional: unknown[]) =>
  generateQueryKey(RequestKey.Lfg, user, ...additional);

export const lfgBoardQueryKey = (user: QueryUser, filters?: LfgBoardFilters) =>
  filters ? lfgKey(user, 'board', filters) : lfgKey(user, 'board');

export const lfgPostQueryKey = (user: QueryUser, id: string) =>
  lfgKey(user, 'post', id);

export const myLfgPostQueryKey = (user: QueryUser) => lfgKey(user, 'my_post');

export const lfgReachOutsLeftQueryKey = (user: QueryUser) =>
  lfgKey(user, 'reach_outs_left');

export const lfgInboxQueryKey = (user: QueryUser, filtered?: boolean) =>
  filtered === undefined
    ? lfgKey(user, 'inbox')
    : lfgKey(user, 'inbox', { filtered });

export const lfgHelperQueryKey = (user: QueryUser) => lfgKey(user, 'helper');

export const lfgBoardQueryOptions = (
  user: QueryUser,
  filters: LfgBoardFilters,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  infiniteQueryOptions({
    queryKey: lfgBoardQueryKey(user, filters),
    queryFn: ({ pageParam }) =>
      getLfgBoard({ filters, after: pageParam || undefined }),
    initialPageParam: '',
    getNextPageParam: (page) => getNextPageParam(page?.pageInfo),
    staleTime: StaleTime.OneMinute,
    enabled: !!user?.id && enabled,
  });

export const lfgBoardFacetsQueryOptions = (
  user: QueryUser,
  kind: LfgKind | undefined,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  queryOptions({
    queryKey: lfgKey(user, 'facets', kind ?? null),
    queryFn: () => getLfgBoardFacets(kind),
    staleTime: StaleTime.Default,
    enabled: !!user?.id && enabled,
  });

export const lfgPostQueryOptions = (user: QueryUser, id: string) =>
  queryOptions<LfgPost | null>({
    queryKey: lfgPostQueryKey(user, id),
    queryFn: () => getLfgPost(id),
    staleTime: StaleTime.OneMinute,
    enabled: !!user?.id && !!id,
  });

export const myLfgPostQueryOptions = (
  user: QueryUser,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  queryOptions<LfgPost | null>({
    queryKey: myLfgPostQueryKey(user),
    queryFn: getMyLfgPost,
    staleTime: StaleTime.Default,
    enabled: !!user?.id && enabled,
  });

export const userLfgPostQueryKey = (user: QueryUser, userId: string) =>
  lfgKey(user, 'user_post', userId);

export const userLfgPostQueryOptions = (
  user: QueryUser,
  userId: string,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  queryOptions({
    queryKey: userLfgPostQueryKey(user, userId),
    queryFn: () => getUserLfgPost(userId),
    staleTime: StaleTime.Default,
    enabled: !!user?.id && !!userId && enabled,
  });

export const lfgAcceptedReachOutsQueryOptions = (
  user: QueryUser,
  postId: string,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  queryOptions({
    queryKey: lfgKey(user, 'accepted', postId),
    queryFn: () => getLfgAcceptedReachOuts(postId),
    staleTime: StaleTime.OneMinute,
    enabled: !!user?.id && !!postId && enabled,
  });

export const lfgPersonQueryKey = (user: QueryUser, userId: string) =>
  lfgKey(user, 'person', userId);

// What a reach-out carries of the viewer, which the Stand out nudges fill in.
export const lfgPersonQueryOptions = (user: QueryUser, userId: string) =>
  queryOptions({
    queryKey: lfgPersonQueryKey(user, userId),
    queryFn: () => getLfgPerson(userId),
    staleTime: StaleTime.Default,
    enabled: !!user?.id && !!userId,
  });

export const lfgStreakQueryOptions = (user: QueryUser, userId: string) =>
  queryOptions({
    queryKey: lfgKey(user, 'streak', userId),
    queryFn: () => getLfgStreak(userId),
    staleTime: StaleTime.OneHour,
    enabled: !!user?.id && !!userId,
  });

export const lfgReachOutsLeftQueryOptions = (
  user: QueryUser,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  queryOptions<number>({
    queryKey: lfgReachOutsLeftQueryKey(user),
    queryFn: getLfgReachOutsLeft,
    staleTime: StaleTime.OneMinute,
    enabled: !!user?.id && enabled,
  });

export const lfgInboxQueryOptions = (
  user: QueryUser,
  filtered: boolean,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  queryOptions({
    queryKey: lfgInboxQueryKey(user, filtered),
    queryFn: () => getLfgReachOutInbox(filtered),
    staleTime: StaleTime.OneMinute,
    enabled: !!user?.id && enabled,
  });

export const lfgReachOutQueryOptions = (user: QueryUser, id: string) =>
  queryOptions({
    queryKey: lfgKey(user, 'reach_out', id),
    queryFn: () => getLfgReachOut(id),
    staleTime: StaleTime.OneMinute,
    enabled: !!user?.id && !!id,
  });

export const lfgHelperQueryOptions = (
  user: QueryUser,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  queryOptions({
    queryKey: lfgHelperQueryKey(user),
    queryFn: getLfgHelper,
    staleTime: StaleTime.Default,
    enabled: !!user?.id && enabled,
  });

export const lfgHelperSuggestedTagsQueryOptions = (
  user: QueryUser,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  queryOptions({
    queryKey: lfgKey(user, 'helper_suggested_tags'),
    queryFn: getLfgHelperSuggestedTags,
    staleTime: StaleTime.OneHour,
    enabled: !!user?.id && enabled,
  });

export const lfgConversationQueryOptions = (
  user: QueryUser,
  peerId: string,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  queryOptions({
    queryKey: lfgKey(user, 'conversation', peerId),
    queryFn: () => getLfgConversation(peerId),
    staleTime: StaleTime.Default,
    enabled: !!user?.id && !!peerId && enabled,
  });

// The post's own page, the board rows and the viewer's open post all show
// the same post, so a change to it lands in every copy.
export const updateLfgPostCaches = (
  client: QueryClient,
  user: QueryUser,
  post: LfgPost,
): void => {
  client.setQueryData(lfgPostQueryKey(user, post.id), post);
  client.invalidateQueries({ queryKey: lfgBoardQueryKey(user) });
  client.invalidateQueries({ queryKey: myLfgPostQueryKey(user) });
  client.invalidateQueries({ queryKey: lfgKey(user, 'user_post') });
};

// After a reach-out is answered: the inbox, the post's counts and, once it
// turned into a chat, the conversations.
export const invalidateLfgReachOutQueries = (
  client: QueryClient,
  user: QueryUser,
): void => {
  client.invalidateQueries({ queryKey: lfgInboxQueryKey(user) });
  client.invalidateQueries({ queryKey: myLfgPostQueryKey(user) });
  client.invalidateQueries({ queryKey: lfgKey(user, 'post') });
  client.invalidateQueries({ queryKey: lfgKey(user, 'accepted') });
  client.invalidateQueries({ queryKey: lfgKey(user, 'conversation') });
};
