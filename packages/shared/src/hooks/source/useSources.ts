import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { SOURCES_QUERY } from '../../graphql/squads';
import { Connection, gqlClient } from '../../graphql/common';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { Source, Squad } from '../../graphql/sources';

export interface SourcesQueryData<T extends Source | Squad> {
  sources: Connection<T>;
}

interface UseSources<T extends Source | Squad> {
  result: UseInfiniteQueryResult<SourcesQueryData<T>>;
}

export interface SourcesQueryProps {
  isPublic?: boolean;
  featured?: boolean;
  categoryId?: string;
  sortByMembersCount?: boolean;
  publicThreshold?: boolean;
  first?: number;
}

interface UseSourcesProps {
  query?: SourcesQueryProps;
}

export const useSources = <T extends Source | Squad>({
  query = {},
}: UseSourcesProps = {}): UseSources<T> => {
  const {
    featured,
    isPublic,
    categoryId,
    first = 100,
    sortByMembersCount,
  } = query;
  const result = useInfiniteQuery(
    generateQueryKey(
      RequestKey.Sources,
      null,
      featured,
      isPublic,
      categoryId,
      first,
    ),
    ({ pageParam }) =>
      gqlClient.request(SOURCES_QUERY, {
        filterOpenSquads: isPublic,
        categoryId,
        featured,
        first,
        after: pageParam,
        sortByMembersCount,
      }),
    {
      getNextPageParam: (lastPage) =>
        lastPage?.sources?.pageInfo?.hasNextPage &&
        lastPage?.sources?.pageInfo?.endCursor,
      staleTime: StaleTime.Default,
    },
  );

  return { result };
};
