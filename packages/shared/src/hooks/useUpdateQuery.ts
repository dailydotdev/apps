import type {
  DefaultError,
  QueryKey,
  UseQueryOptions,
} from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export type UseUpdateQuery<TQueryFnData = unknown> = [
  () => TQueryFnData | undefined,
  (newData: TQueryFnData) => void,
];

export const useUpdateQuery = <
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>({
  queryKey,
}: UseQueryOptions<
  TQueryFnData,
  TError,
  TData,
  TQueryKey
>): UseUpdateQuery<TQueryFnData> => {
  const queryClient = useQueryClient();

  const get = useCallback(() => {
    return structuredClone(
      queryClient.getQueryData<TQueryFnData, QueryKey>(queryKey),
    );
  }, [queryClient, queryKey]);

  const set = useCallback(
    (newData: TQueryFnData) => {
      return queryClient.setQueryData<TQueryFnData, QueryKey>(
        queryKey,
        newData,
      );
    },
    [queryClient, queryKey],
  );

  return [get, set];
};
