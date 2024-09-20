import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  POST_CODE_SNIPPETS_PER_PAGE_DEFAULT,
  POST_CODE_SNIPPETS_QUERY,
  PostCodeSnippet,
} from '../../graphql/posts';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { Connection, gqlClient } from '../../graphql/common';

type UsePostCodeSnippetsData = Connection<PostCodeSnippet>;

export type UsePostCodeSnippetsQueryProps = {
  postId: string | undefined;
  perPage?: number;
  queryOptions?: Omit<
    UseInfiniteQueryOptions<UsePostCodeSnippetsData>,
    'select' | 'getNextPageParam'
  >;
};

export type UsePostCodeSnippetsQuery =
  UseInfiniteQueryResult<UsePostCodeSnippetsData>;

export const usePostCodeSnippetsQuery = ({
  postId,
  perPage = POST_CODE_SNIPPETS_PER_PAGE_DEFAULT,
  queryOptions,
}: UsePostCodeSnippetsQueryProps): UsePostCodeSnippetsQuery => {
  const enabled = !!postId;

  const queryResult = useInfiniteQuery(
    generateQueryKey(RequestKey.PostCodeSnippets, null, {
      id: postId,
    }),
    async ({ pageParam }) => {
      const result = await gqlClient.request<{
        postCodeSnippets: UsePostCodeSnippetsData;
      }>(POST_CODE_SNIPPETS_QUERY, {
        id: postId,
        first: perPage,
        after: pageParam,
      });

      return result.postCodeSnippets;
    },
    {
      staleTime: StaleTime.OneHour,
      ...queryOptions,
      enabled:
        typeof queryOptions?.enabled !== 'undefined'
          ? queryOptions.enabled && enabled
          : enabled,
      getNextPageParam: (lastPage) =>
        lastPage?.pageInfo?.hasNextPage && lastPage?.pageInfo?.endCursor,
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
    },
  );

  return queryResult;
};
