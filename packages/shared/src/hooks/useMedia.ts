import { useEffect, useState } from 'react';

export default function useMedia<T>(
  queries: string[],
  values: T[],
  defaultValue: T,
  ssrValue = defaultValue,
): T {
  const getMedia = (): MediaQueryList[] =>
    queries.map((q) => window.matchMedia(q));

  const getValue = (mediaQueryLists: MediaQueryList[]) => {
    const index = mediaQueryLists.findIndex((mql) => mql.matches);
    return values?.[index] || defaultValue;
  };

  const [value, setValue] = useState<T>(
    typeof window !== 'undefined' ? getValue(getMedia()) : ssrValue,
  );

  useEffect(() => {
    const mediaQueryLists = getMedia();
    const handler = () => setValue(getValue(mediaQueryLists));
    handler();
    const isModern = 'addEventListener' in mediaQueryLists[0];
    mediaQueryLists.forEach((mql) => {
      if (isModern) {
        mql.addEventListener('change', handler);
      } else {
        mql.addListener(handler);
      }
    });
    return () =>
      mediaQueryLists.forEach((mql) => {
        if (isModern) {
          mql.removeEventListener('change', handler);
        } else {
          mql.removeListener(handler);
        }
      });
  }, [values]);

  return value;
}
