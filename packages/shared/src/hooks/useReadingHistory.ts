import { useQueryClient, useMutation, QueryKey } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '../lib/config';
import {
  HidePostItemCardProps,
  HIDE_READING_HISTORY_MUTATION,
} from '../graphql/users';
import { ReadHistoryInfiniteData } from './useInfiniteReadingHistory';

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
      request(`${apiUrl}/graphql`, HIDE_READING_HISTORY_MUTATION, {
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
