import { createContextProvider } from '@kickass-coderz/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import type { SearchTimeKey } from '../../graphql/search';
import {
  defaultSearchTime,
  getSearchTimeFromUrl,
  getSearchTimeQueryParam,
} from '../../graphql/search';

const [SearchProvider, useSearchContextProvider] = createContextProvider(
  () => {
    const router = useRouter();
    const [time, setTimeState] = useState<SearchTimeKey>(defaultSearchTime);
    const [postTypes, setPostTypes] = useState<Record<string, boolean>>({});

    // Hydrate the time filter from the URL so shared/bookmarked links like
    // /search?q=react&time=7d apply the filter on load. Runs once the router is
    // ready since query params are not populated during the first render.
    useEffect(() => {
      if (!router?.isReady) {
        return;
      }

      setTimeState(
        getSearchTimeFromUrl(router.query?.time?.toString()) ??
          defaultSearchTime,
      );
    }, [router?.isReady, router?.query?.time]);

    const setTime = useCallback(
      (value: SearchTimeKey) => {
        setTimeState(value);

        if (!router?.isReady) {
          return;
        }

        const query = { ...router.query, ...getSearchTimeQueryParam(value) };
        if (value === defaultSearchTime) {
          delete query.time;
        }

        router.replace({ pathname: router.pathname, query }, undefined, {
          shallow: true,
        });
      },
      [router],
    );

    const contentCurationFilter = useMemo(
      () => Object.keys(postTypes).filter((key) => postTypes[key] === true),
      [postTypes],
    );

    return { time, setTime, postTypes, setPostTypes, contentCurationFilter };
  },
  {
    scope: 'SearchContext',
  },
);
export { SearchProvider, useSearchContextProvider };
