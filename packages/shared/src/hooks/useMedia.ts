import { useEffect, useState } from 'react';

// Set once the first client render has committed. Markup rendered after that
// never has to match the server, so a later mount can read the media query at
// once instead of waiting an effect, which lands a frame after the page paints.
let hydrated = false;

export default function useMedia<T>(
  queries: string[],
  values: T[],
  defaultValue: T,
  ssrValue = defaultValue,
  afterHydration = false,
): T {
  const getMedia = (): MediaQueryList[] =>
    queries.map((q) => window.matchMedia(q));

  const getValue = (mediaQueryLists: MediaQueryList[]) => {
    const index = mediaQueryLists.findIndex((mql) => mql.matches);
    return values?.[index] || defaultValue;
  };

  const [value, setValue] = useState<T>(() => {
    if (afterHydration && !hydrated) {
      return undefined as T;
    }

    return typeof window !== 'undefined' ? getValue(getMedia()) : ssrValue;
  });

  useEffect(() => {
    hydrated = true;
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
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, queries]);

  return value;
}

export const useMediaClient = <T>(
  queries: string[],
  values: T[],
  defaultValue: T,
): T => useMedia(queries, values, defaultValue, undefined, true);

export { useMedia };
