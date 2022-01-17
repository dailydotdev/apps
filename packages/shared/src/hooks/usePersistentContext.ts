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
): [T, (value: T) => Promise<void>] {
  const queryClient = useQueryClient();

  const { data } = useQuery<unknown, unknown, T>(
    [key, valueWhenCacheEmpty],
    () => getAsyncCache<T>(key, valueWhenCacheEmpty, validValues),
  );

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
