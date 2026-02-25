import type { QueryKey, UseQueryResult } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { disabledRefetch } from '../../lib/func';

type UseQueryState<T> = [
  T,
  (value: T) => void,
  Omit<UseQueryResult<T>, 'data'>,
];

interface UseQueryStateProps<T> {
  key: QueryKey;
  defaultValue: T;
}

export enum QueryStateKeys {
  FeedPeriod = 'feedPeriod',
}

export const useQueryState = <T>({
  key,
  defaultValue,
}: UseQueryStateProps<T>): UseQueryState<T> => {
  const client = useQueryClient();
  const { data = defaultValue, ...rest } = useQuery<T>({
    queryKey: key,
    queryFn: () => client.getQueryData<T>(key) ?? defaultValue,
    ...disabledRefetch,
    initialData: defaultValue,
    staleTime: Infinity,
  });
  const setState = useCallback(
    (value: T) => client.setQueryData<T>(key, value),
    [client, key],
  );

  return [data, setState, rest];
};
