import { useQuery, useMutation, useQueryClient } from 'react-query';
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

export default function usePersistentContext<T>(
  key: string,
  valueWhenCacheEmpty?: T,
  validValues?: T[],
  fallbackValue?: T,
): [T, (value: T) => Promise<void>, boolean] {
  const queryKey = [key, valueWhenCacheEmpty];
  const queryClient = useQueryClient();

  const { data, isFetched } = useQuery<unknown, unknown, T>(queryKey, () =>
    getAsyncCache<T>(key, valueWhenCacheEmpty, validValues),
  );

  const { mutateAsync: updateValue } = useMutation<void, unknown, unknown, T>(
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

  return [data ?? fallbackValue, updateValue, isFetched];
}
