import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import { SOURCES_QUERY } from '../../graphql/squads';
import type { Connection, Edge } from '../../graphql/common';
import { gqlClient } from '../../graphql/common';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
  StaleTime,
} from '../../lib/query';
import type { Source, Squad } from '../../graphql/sources';

export interface SourcesQueryData<T extends Source | Squad> {
  sources: Connection<T>;
}

interface UseSources<T extends Source | Squad> {
  result: UseInfiniteQueryResult<InfiniteData<SourcesQueryData<T>>>;
}

export interface SourcesQueryProps {
  isPublic?: boolean;
  featured?: boolean;
  categoryId?: string;
  sortByMembersCount?: boolean;
  first?: number;
}

interface UseSourcesProps {
  query?: SourcesQueryProps;
  isEnabled?: boolean;
}

export function getFlatteredNodes<T extends Source | Squad>({
  data,
}: Pick<UseSources<T>['result'], 'data'>): Edge<T>[] {
  return data?.pages.flatMap((page) => page.sources.edges) ?? [];
}

export function getFlatteredSources<T extends Source | Squad>({
  data,
}: Pick<UseSources<T>['result'], 'data'>): T[] {
  return getFlatteredNodes<T>({ data }).map((edge) => edge.node);
}

export const useSources = <T extends Source | Squad>({
  query = {},
  isEnabled = true,
}: UseSourcesProps = {}): UseSources<T> => {
  const {
    featured,
    isPublic,
    categoryId,
    first = 100,
    sortByMembersCount,
  } = query;
  const result = useInfiniteQuery({
    queryKey: generateQueryKey(
      RequestKey.Sources,
      null,
      featured,
      isPublic,
      categoryId,
      first,
    ),
    queryFn: ({ pageParam }) =>
      gqlClient.request(SOURCES_QUERY, {
        filterOpenSquads: isPublic,
        categoryId,
        featured,
        first,
        after: pageParam,
        sortByMembersCount,
      }),
    initialPageParam: '',
    getNextPageParam: ({ sources }) => getNextPageParam(sources?.pageInfo),
    staleTime: StaleTime.Default,
    enabled: isEnabled,
  });

  return { result };
};
