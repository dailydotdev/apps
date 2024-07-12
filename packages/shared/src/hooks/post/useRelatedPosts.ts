import {
  useQueryClient,
  useInfiniteQuery,
  InfiniteData,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import { Connection } from '../../graphql/common';
import {
  RelatedPost,
  RELATED_POSTS_QUERY,
  PostRelationType,
  PostData,
  RELATED_POSTS_PER_PAGE_DEFAULT,
} from '../../graphql/posts';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { getPostByIdKey } from '../usePostById';
import { useRequestProtocol } from '../useRequestProtocol';

export type UseRelatedPostsProps = {
  postId: string;
  relationType: PostRelationType;
  perPage?: number;
};

type RelatedPostsQueryData = Connection<RelatedPost>;

export type UseRelatedPosts = {
  relatedPosts: InfiniteData<RelatedPostsQueryData>;
  isLoading: boolean;
  hasNextPage: boolean;
  fetchNextPage: UseInfiniteQueryResult<RelatedPostsQueryData>['fetchNextPage'];
  isFetchingNextPage: boolean;
};

export const useRelatedPosts = ({
  postId,
  relationType,
  perPage = RELATED_POSTS_PER_PAGE_DEFAULT,
}: UseRelatedPostsProps): UseRelatedPosts => {
  const { requestMethod } = useRequestProtocol();
  const queryClient = useQueryClient();

  const {
    data: relatedPosts,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    generateQueryKey(RequestKey.RelatedPosts, null, {
      id: postId,
      type: relationType,
    }),
    async ({ pageParam }) => {
      const result = await requestMethod<{
        relatedPosts: RelatedPostsQueryData;
      }>(RELATED_POSTS_QUERY, {
        id: postId,
        relationType,
        first: perPage,
        after: pageParam,
      });

      return result.relatedPosts;
    },
    {
      enabled: !!postId,
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
      staleTime: StaleTime.Default,
      initialData: () => {
        if (relationType === PostRelationType.Collection) {
          const postQueryData = queryClient.getQueryData<PostData>(
            getPostByIdKey(postId),
          );

          if (postQueryData?.relatedCollectionPosts) {
            return {
              pages: [postQueryData.relatedCollectionPosts],
              pageParams: [null],
            };
          }
        }

        return undefined;
      },
    },
  );

  return {
    relatedPosts,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
};
