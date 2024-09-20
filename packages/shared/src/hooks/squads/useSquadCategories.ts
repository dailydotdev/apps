import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { gqlClient } from '../../graphql/common';
import {
  SourceCategoryData,
  SOURCE_CATEGORIES_QUERY,
} from '../../graphql/sources';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';

export const useSquadCategories =
  (): UseInfiniteQueryResult<SourceCategoryData> => {
    const result = useInfiniteQuery<SourceCategoryData>(
      generateQueryKey(RequestKey.Source, null, 'categories'),
      () => gqlClient.request(SOURCE_CATEGORIES_QUERY),
      { staleTime: StaleTime.OneDay },
    );

    return result;
  };
