import { QueryKey, useQueryClient } from 'react-query';

interface UseQueryData<T> {
  isFetching?: boolean;
  data?: T;
}

function useQueryData<T = unknown>(
  key: QueryKey,
  fallbackValue?: T,
): UseQueryData<T> {
  const client = useQueryClient();
  const data = client.getQueriesData<T>(key)?.[0]?.[1] || fallbackValue;
  const { isFetching } = client.getQueryState(key) || {};

  return { isFetching, data };
}

export default useQueryData;
