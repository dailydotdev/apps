import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { SearchTagsData, SEARCH_TAGS_QUERY } from '../graphql/feedSettings';
import { LogEvent, Origin } from '../lib/log';
import { graphqlUrl } from '../lib/config';
import { getSearchTagsQueryKey } from './useMutateFilters';
import LogContext from '../contexts/LogContext';

export type UseTagSearchProps = {
  value: string;
  origin: Origin;
};

export type UseTagSearch = {
  data?: SearchTagsData;
  isLoading: boolean;
};

export const MIN_SEARCH_QUERY_LENGTH = 2;

export const useTagSearch = ({
  value,
  origin,
}: UseTagSearchProps): UseTagSearch => {
  const { logEvent } = useContext(LogContext);

  const { data, isLoading } = useQuery(
    getSearchTagsQueryKey(value),
    async () => {
      const result = await request<SearchTagsData>(
        graphqlUrl,
        SEARCH_TAGS_QUERY,
        { query: value },
      );

      if (result.searchTags.query) {
        logEvent({
          event_name: LogEvent.SearchTags,
          extra: JSON.stringify({
            tag_search_term: result.searchTags.query,
            tag_return_value: result.searchTags.tags.length,
            origin,
          }),
        });
      }

      return result;
    },
    { enabled: value?.length >= MIN_SEARCH_QUERY_LENGTH },
  );

  return {
    data,
    isLoading,
  };
};
