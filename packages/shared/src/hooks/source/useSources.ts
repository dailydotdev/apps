import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { SOURCES_QUERY } from '../../graphql/squads';
import { Connection, gqlClient } from '../../graphql/common';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { Source, Squad } from '../../graphql/sources';

interface SourcesQueryData {
  sources: Connection<Source | Squad>;
}

interface UseSources {
  result: UseInfiniteQueryResult<SourcesQueryData>;
}

interface QueryProps {
  isPublic?: boolean;
  isFeatured?: boolean;
  categoryId?: string;
}

interface UseSourcesProps {
  query?: QueryProps;
}

export const useSources = ({
  query = {},
}: UseSourcesProps = {}): UseSources => {
  const { isFeatured, isPublic, categoryId } = query;
  const result = useInfiniteQuery(
    generateQueryKey(RequestKey.Sources),
    ({ pageParam }) =>
      gqlClient.request(SOURCES_QUERY, {
        categoryId,
        featured: isFeatured,
        filterOpenSquads: isPublic,
        first: 100,
        after: pageParam,
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
