import { useEffect, useState } from 'react';
import { get as getCache, set as setCache } from 'idb-keyval';

export default function usePersistentState<T>(
  key: string,
  initialValue: T,
  valueWhenCacheEmpty?: T,
  persistIfEmpty?: boolean,
): [T, (value: T) => Promise<void>, boolean] {
  const [value, setValue] = useState(initialValue);
  const [loaded, setLoaded] = useState(false);

  const setValueAndPersist = (newValue: T): Promise<void> => {
    if (newValue !== value) {
      setValue(newValue);
      return setCache(key, newValue);
    }
    return Promise.resolve();
  };

  useEffect(() => {
    getCache<T>(key)
      .then(async (cachedValue) => {
        if (cachedValue !== undefined) {
          setValue(cachedValue);
        } else if (valueWhenCacheEmpty !== undefined) {
          if (persistIfEmpty) {
            await setValueAndPersist(valueWhenCacheEmpty);
          } else {
            setValue(valueWhenCacheEmpty);
          }
        }
        setLoaded(true);
      })
      .catch(() => {
        if (valueWhenCacheEmpty !== undefined) {
          setValue(valueWhenCacheEmpty);
        }
        setLoaded(true);
      });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [value, setValueAndPersist, loaded];
}
