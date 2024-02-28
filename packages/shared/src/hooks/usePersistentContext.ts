import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get as getCache, set as setCache } from 'idb-keyval';

function getAsyncCache<T>(key, valueWhenCacheEmpty, validValues): Promise<T> {
  return getCache<T>(key)
    .then((cachedValue) => {
      if (
        cachedValue !== undefined &&
        (validValues === undefined || validValues.includes(cachedValue))
      ) {
        return cachedValue;
      }
      return valueWhenCacheEmpty;
    })
    .catch(() => {
      return valueWhenCacheEmpty;
    });
}

export type UserPersistentContextType<T> = [
  T,
  (value: T) => Promise<void>,
  boolean,
  boolean,
];

export default function usePersistentContext<T>(
  key: string,
  valueWhenCacheEmpty?: T,
  validValues?: T[],
  fallbackValue?: T,
): UserPersistentContextType<T> {
  const queryKey = [key, valueWhenCacheEmpty];
  const queryClient = useQueryClient();

  const { data, isFetched } = useQuery(
    queryKey,
    () =>
      getAsyncCache<T>(key, valueWhenCacheEmpty || null, validValues) || null,
  );

  const { mutateAsync: updateValue, isLoading } = useMutation(
    (value: T) => setCache(key, value),
    {
      onMutate: (mutatedData) => {
        const current = data;
        queryClient.setQueryData(queryKey, mutatedData);
        return current;
      },
      onError: (_, __, rollback) => {
        queryClient.setQueryData(queryKey, rollback);
      },
    },
  );

  return [data ?? fallbackValue, updateValue, isFetched, isLoading];
}
