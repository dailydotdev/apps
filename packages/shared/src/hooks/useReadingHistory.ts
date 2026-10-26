import type { QueryClient } from '@tanstack/react-query';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { HidePostItemCardProps } from '../graphql/users';
import { HIDE_READING_HISTORY_MUTATION } from '../graphql/users';
import type { ReadHistoryInfiniteData } from './useInfiniteReadingHistory';
import type { ReadHistoryPost } from '../graphql/posts';
import { gqlClient } from '../graphql/common';
import { useAuthContext } from '../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../lib/query';
import type { LoggedUser } from '../lib/user';

export type HideReadHistory = (
  params: HidePostItemCardProps,
) => Promise<unknown>;

export interface UseReadingHistoryReturn {
  hideReadHistory: HideReadHistory;
}

type HistorySnapshot = [
  readonly unknown[],
  ReadHistoryInfiniteData | undefined,
][];

const getReadingHistoryKey = (user?: LoggedUser) =>
  generateQueryKey(RequestKey.ReadingHistory, user);

const restoreSnapshot = (client: QueryClient, snapshot: HistorySnapshot) =>
  snapshot.forEach(([queryKey, data]) => client.setQueryData(queryKey, data));

// The list and every search over it live under the same base key, so a
// change to one read has to reach all of them.
const updateReadingHistoryQueries = (
  client: QueryClient,
  user: LoggedUser | undefined,
  update: (data: ReadHistoryInfiniteData) => ReadHistoryInfiniteData,
): (() => void) => {
  const queryKey = getReadingHistoryKey(user);
  const snapshot = client.getQueriesData<ReadHistoryInfiniteData>({
    queryKey,
  });
  client.setQueriesData<ReadHistoryInfiniteData>({ queryKey }, (data) =>
    data ? update(data) : data,
  );

  return () => restoreSnapshot(client, snapshot);
};

export const updateReadingHistoryPost = (
  client: QueryClient,
  user: LoggedUser | undefined,
  postId: string,
  manipulate: (post: ReadHistoryPost) => Partial<ReadHistoryPost>,
): (() => void) =>
  updateReadingHistoryQueries(client, user, (data) => ({
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      readHistory: {
        ...page.readHistory,
        edges: page.readHistory.edges.map((edge) =>
          edge.node.post.id === postId
            ? {
                ...edge,
                node: {
                  ...edge.node,
                  post: { ...edge.node.post, ...manipulate(edge.node.post) },
                },
              }
            : edge,
        ),
      },
    })),
  }));

const isSameRead = (a?: Date | string, b?: Date | string): boolean =>
  !!a && !!b && new Date(a).getTime() === new Date(b).getTime();

export const removeReadingHistoryEntry = (
  client: QueryClient,
  user: LoggedUser | undefined,
  { postId, timestamp }: HidePostItemCardProps,
): (() => void) =>
  updateReadingHistoryQueries(client, user, (data) => ({
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      readHistory: {
        ...page.readHistory,
        edges: page.readHistory.edges.filter(
          ({ node }) =>
            !(
              node.post.id === postId && isSameRead(node.timestampDb, timestamp)
            ),
        ),
      },
    })),
  }));

function useReadingHistory(): UseReadingHistoryReturn {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const { mutateAsync } = useMutation<
    unknown,
    unknown,
    HidePostItemCardProps,
    () => void
  >({
    mutationFn: ({ postId, timestamp }: HidePostItemCardProps) =>
      gqlClient.request(HIDE_READING_HISTORY_MUTATION, {
        postId,
        timestamp,
      }),
    onMutate: (params) => removeReadingHistoryEntry(client, user, params),
    onError: (_, __, rollback) => rollback?.(),
  });

  const hideReadHistory = useCallback<HideReadHistory>(
    (params) => mutateAsync(params),
    [mutateAsync],
  );

  return { hideReadHistory };
}

export default useReadingHistory;
