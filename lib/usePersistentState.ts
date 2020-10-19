import { useEffect, useState } from 'react';
import { get as getCache, set as setCache } from 'idb-keyval';

export default function usePersistentState<T>(
  key: string,
  initialValue: T,
  valueWhenCacheEmpty?: T,
): [T, (value: T) => Promise<void>] {
  const [value, setValue] = useState(initialValue);

  const setValueAndPersist = (newValue: T): Promise<void> => {
    if (newValue !== value) {
      setValue(newValue);
      return setCache(key, newValue);
    }
    return Promise.resolve();
  };

  useEffect(() => {
    getCache<T>(key).then((cachedValue) => {
      if (cachedValue !== undefined) {
        setValue(cachedValue);
      } else if (valueWhenCacheEmpty !== undefined) {
        setValue(valueWhenCacheEmpty);
      }
    });
  }, []);

  return [value, setValueAndPersist];
}
