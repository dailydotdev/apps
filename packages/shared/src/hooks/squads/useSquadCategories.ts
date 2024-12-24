import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import { gqlClient } from '../../graphql/common';
import type { SourceCategoryData } from '../../graphql/sources';
import { SOURCE_CATEGORIES_QUERY } from '../../graphql/sources';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
  StaleTime,
} from '../../lib/query';

export const useSquadCategories = (): UseInfiniteQueryResult<
  InfiniteData<SourceCategoryData>
> =>
  useInfiniteQuery<SourceCategoryData>({
    queryKey: generateQueryKey(RequestKey.Source, null, 'categories'),
    queryFn: () => gqlClient.request(SOURCE_CATEGORIES_QUERY),
    staleTime: StaleTime.OneDay,
    initialPageParam: '',
    getNextPageParam: ({ categories }) =>
      getNextPageParam(categories?.pageInfo),
  });
