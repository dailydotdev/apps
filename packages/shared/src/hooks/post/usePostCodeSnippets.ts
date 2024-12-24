import type {
  InfiniteData,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { PostCodeSnippet } from '../../graphql/posts';
import {
  POST_CODE_SNIPPETS_PER_PAGE_DEFAULT,
  POST_CODE_SNIPPETS_QUERY,
} from '../../graphql/posts';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
  StaleTime,
} from '../../lib/query';
import type { Connection } from '../../graphql/common';
import { gqlClient } from '../../graphql/common';

type UsePostCodeSnippetsData = Connection<PostCodeSnippet>;

export type UsePostCodeSnippetsQueryProps = {
  postId: string | undefined;
  perPage?: number;
  queryOptions?: Omit<
    UseInfiniteQueryOptions<UsePostCodeSnippetsData>,
    'select' | 'getNextPageParam'
  >;
};

export type UsePostCodeSnippetsQuery = UseInfiniteQueryResult<
  InfiniteData<UsePostCodeSnippetsData>
>;

export const usePostCodeSnippetsQuery = ({
  postId,
  perPage = POST_CODE_SNIPPETS_PER_PAGE_DEFAULT,
  queryOptions,
}: UsePostCodeSnippetsQueryProps): UsePostCodeSnippetsQuery => {
  const enabled = !!postId;

  const queryResult = useInfiniteQuery({
    queryKey: generateQueryKey(RequestKey.PostCodeSnippets, null, {
      id: postId,
    }),
    queryFn: async ({ pageParam }) => {
      const result = await gqlClient.request<{
        postCodeSnippets: UsePostCodeSnippetsData;
      }>(POST_CODE_SNIPPETS_QUERY, {
        id: postId,
        first: perPage,
        after: pageParam,
      });

      return result.postCodeSnippets;
    },
    initialPageParam: '',
    staleTime: StaleTime.OneHour,
    ...queryOptions,
    enabled:
      typeof queryOptions?.enabled !== 'undefined'
        ? queryOptions.enabled && enabled
        : enabled,
    getNextPageParam: (lastPage) => getNextPageParam(lastPage?.pageInfo),
    select: useCallback((data) => {
      if (!data) {
        return undefined;
      }

      return {
        ...data,
        // filter out last page with no edges returned by api paginator
        pages: data.pages.filter((pageItem) => !!pageItem?.edges.length),
      };
    }, []),
  });

  return queryResult;
};
