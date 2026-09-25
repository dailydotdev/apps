import { createContextProvider } from '@kickass-coderz/react';
import type { SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import type { SearchTimeKey } from '../../graphql/search';
import {
  defaultSearchTime,
  getSearchContentCurationFromUrl,
  getSearchContentCurationQueryParam,
  getSearchPostTypesFromUrl,
  getSearchPostTypesQueryParam,
  getSearchTimeFromUrl,
  getSearchTimeQueryParam,
} from '../../graphql/search';

type SearchFilterSelection = Record<string, boolean>;

const getSelectedFilters = (filters: SearchFilterSelection): string[] =>
  Object.keys(filters).filter((key) => filters[key] === true);

const getFiltersFromValues = (values: string[]): SearchFilterSelection =>
  values.reduce<SearchFilterSelection>((acc, value) => {
    acc[value] = true;
    return acc;
  }, {});

const getNextFilters = (
  value: SetStateAction<SearchFilterSelection>,
  prev: SearchFilterSelection,
): SearchFilterSelection => (typeof value === 'function' ? value(prev) : value);

const [SearchProvider, useSearchContextProvider] = createContextProvider(
  () => {
    const router = useRouter();
    const [time, setTimeState] = useState<SearchTimeKey>(defaultSearchTime);
    const [contentCuration, setContentCurationState] =
      useState<SearchFilterSelection>({});
    const [postTypes, setPostTypesState] = useState<SearchFilterSelection>({});

    const replaceSearchQuery = useCallback(
      (params: Record<string, string | undefined>, keys: string[]) => {
        if (!router?.isReady) {
          return;
        }

        const query = { ...router.query, ...params };
        keys.forEach((key) => {
          if (!params[key]) {
            delete query[key];
          }
        });

        router.replace({ pathname: router.pathname, query }, undefined, {
          shallow: true,
        });
      },
      [router],
    );

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
      setContentCurationState(
        getFiltersFromValues(
          getSearchContentCurationFromUrl(
            router.query?.contentCuration?.toString(),
          ),
        ),
      );
      setPostTypesState(
        getFiltersFromValues(
          getSearchPostTypesFromUrl(router.query?.type?.toString()),
        ),
      );
    }, [
      router?.isReady,
      router?.query?.contentCuration,
      router?.query?.time,
      router?.query?.type,
    ]);

    const setTime = useCallback(
      (value: SearchTimeKey) => {
        setTimeState(value);
        replaceSearchQuery(getSearchTimeQueryParam(value), ['time']);
      },
      [replaceSearchQuery],
    );

    const setContentCuration = useCallback(
      (value: SetStateAction<SearchFilterSelection>) => {
        const next = getNextFilters(value, contentCuration);
        setContentCurationState(next);
        replaceSearchQuery(
          getSearchContentCurationQueryParam(getSelectedFilters(next)),
          ['contentCuration'],
        );
      },
      [contentCuration, replaceSearchQuery],
    );

    const setPostTypes = useCallback(
      (value: SetStateAction<SearchFilterSelection>) => {
        const next = getNextFilters(value, postTypes);
        setPostTypesState(next);
        replaceSearchQuery(
          getSearchPostTypesQueryParam(getSelectedFilters(next)),
          ['type'],
        );
      },
      [postTypes, replaceSearchQuery],
    );

    const contentCurationFilter = useMemo(
      () => getSelectedFilters(contentCuration),
      [contentCuration],
    );
    const postTypesFilter = useMemo(
      () => getSelectedFilters(postTypes),
      [postTypes],
    );

    return {
      time,
      setTime,
      contentCuration,
      setContentCuration,
      postTypes,
      setPostTypes,
      contentCurationFilter,
      postTypesFilter,
    };
  },
  {
    scope: 'SearchContext',
  },
);
export { SearchProvider, useSearchContextProvider };
