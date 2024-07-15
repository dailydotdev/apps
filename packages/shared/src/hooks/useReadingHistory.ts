import { useQueryClient, useMutation, QueryKey } from '@tanstack/react-query';
import {
  HidePostItemCardProps,
  HIDE_READING_HISTORY_MUTATION,
} from '../graphql/users';
import { ReadHistoryInfiniteData } from './useInfiniteReadingHistory';
import { gqlClient } from '../graphql/common';

export type QueryIndexes = { page: number; edge: number };

export type HideReadHistory = (
  params: HidePostItemCardProps & QueryIndexes,
) => Promise<unknown>;

export interface UseReadingHistoryReturn {
  hideReadHistory: HideReadHistory;
}

function useReadingHistory(key: QueryKey): UseReadingHistoryReturn {
  const client = useQueryClient();
  const { mutateAsync: hideReadHistory } = useMutation<
    unknown,
    unknown,
    HidePostItemCardProps,
    () => void
  >(
    ({ postId, timestamp }: HidePostItemCardProps) =>
      gqlClient.request(HIDE_READING_HISTORY_MUTATION, {
        postId,
        timestamp,
      }),
    {
      onMutate: ({ page, edge }: HidePostItemCardProps & QueryIndexes) => {
        const current = client.getQueryData<ReadHistoryInfiniteData>(key);
        const [history] = current.pages[page].readHistory.edges.splice(edge, 1);
        client.setQueryData(key, (result: ReadHistoryInfiniteData) => ({
          pages: current.pages,
          pageParams: result.pageParams,
        }));

        return () =>
          client.setQueryData(key, (result: ReadHistoryInfiniteData) => {
            result.pages[page].readHistory.edges.push(history);
            return {
              pages: result.pages,
              pageParams: result.pageParams,
            };
          });
      },
      onError: (_, __, rollback) => rollback(),
    },
  );

  return { hideReadHistory };
}

export default useReadingHistory;
