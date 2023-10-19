import request from 'graphql-request';
import { useQuery } from 'react-query';
import { useContext } from 'react';
import { SearchTagsData, SEARCH_TAGS_QUERY } from '../graphql/feedSettings';
import { AnalyticsEvent } from '../lib/analytics';
import { graphqlUrl } from '../lib/config';
import { getSearchTagsQueryKey } from './useMutateFilters';
import AnalyticsContext from '../contexts/AnalyticsContext';

export type UseTagSearchProps = {
  value: string;
};

export type UseTagSearch = {
  data?: SearchTagsData;
  isLoading: boolean;
};

export const useTagSearch = ({ value }: UseTagSearchProps): UseTagSearch => {
  const { trackEvent } = useContext(AnalyticsContext);

  const { data, isLoading } = useQuery(
    getSearchTagsQueryKey(value),
    async () => {
      const result = await request<SearchTagsData>(
        graphqlUrl,
        SEARCH_TAGS_QUERY,
        { query: value },
      );

      if (result.searchTags.query) {
        trackEvent({
          event_name: AnalyticsEvent.SearchTags,
          extra: JSON.stringify({
            tag_search_term: result.searchTags.query,
            tag_return_value: result.searchTags.tags.length,
          }),
        });
      }

      return result;
    },
    { enabled: value?.length > 0 },
  );

  return {
    data,
    isLoading,
  };
};
