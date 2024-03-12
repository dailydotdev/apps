import { useRouter } from 'next/router';
import { useCallback } from 'react';
import {
  SEARCH_POST_SUGGESTIONS,
  SearchProviderEnum,
  SearchSuggestionResult,
  getSearchUrl,
} from '../../graphql/search';
import { useRequestProtocol } from '../useRequestProtocol';
import { graphqlUrl } from '../../lib/config';
import { useFeature } from '../../components/GrowthBookProvider';
import { feature } from '../../lib/featureManagement';

export type UseSearchProviderProps = {
  provider: SearchProviderEnum;
  query: string;
};

export type UseSearchProvider = {
  search: (props: UseSearchProviderProps) => void;
  getSuggestions: (
    props: UseSearchProviderProps,
  ) => Promise<SearchSuggestionResult>;
};

const searchProviderSuggestionsQueryMap: Partial<
  Record<SearchProviderEnum, string>
> = {
  [SearchProviderEnum.Posts]: SEARCH_POST_SUGGESTIONS,
};

export const useSearchProvider = (): UseSearchProvider => {
  const router = useRouter();
  const { requestMethod } = useRequestProtocol();
  const searchVersion = useFeature(feature.searchVersion);

  return {
    search: useCallback(
      ({ provider, query }) => {
        router.push(getSearchUrl({ query, provider }));
      },
      [router],
    ),
    getSuggestions: useCallback(
      async ({ provider, query }) => {
        const graphqlQuery = searchProviderSuggestionsQueryMap[provider];

        if (!graphqlQuery) {
          return {
            hits: [],
          };
        }

        const result = await requestMethod<{
          searchPostSuggestions: SearchSuggestionResult;
        }>(graphqlUrl, searchProviderSuggestionsQueryMap[provider], {
          query,
          version: searchVersion,
        });

        return result.searchPostSuggestions;
      },
      [requestMethod, searchVersion],
    ),
  };
};
