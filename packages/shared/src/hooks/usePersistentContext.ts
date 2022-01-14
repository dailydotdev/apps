import { useQuery, useMutation, useQueryClient } from 'react-query';
import { get as getCache, set as setCache } from 'idb-keyval';
import { useEffect } from 'react';

function getAsyncCache<T>(key, valueWhenCacheEmpty): Promise<T> {
  return getCache<T>(key)
    .then((cachedValue) => {
      if (cachedValue !== undefined) {
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
): [T, (value: T) => Promise<void>] {
  const queryClient = useQueryClient();

  const { data } = useQuery<unknown, unknown, T>(key, () =>
    getAsyncCache<T>(key, valueWhenCacheEmpty),
  );

  useEffect(() => {
    const hasDefaultValue = getAsyncCache(key, null);
    hasDefaultValue.then((defaultValue) => {
      if (defaultValue !== null) return;
      queryClient.setQueryData(key, valueWhenCacheEmpty);
    });
  }, [valueWhenCacheEmpty]);

  const { mutateAsync: updateValue } = useMutation(
    (value: T) => setCache(key, value),
    {
      onMutate: (mutatedData) => {
        queryClient.setQueryData(key, mutatedData);
        return mutatedData;
      },
      onError: () => {},
    },
  );

  return [data, updateValue];
}
