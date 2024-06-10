import {
  QueryKey,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
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
  const { data, ...rest } = useQuery<T>(key, () => client.getQueryData(key), {
    ...disabledRefetch,
    initialData: defaultValue,
    staleTime: Infinity,
  });
  const setState = useCallback(
    (value: T) => client.setQueryData(key, value),
    [client, key],
  );

  return [data, setState, rest];
};
