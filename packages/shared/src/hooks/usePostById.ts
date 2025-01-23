import { useMemo } from 'react';
import type {
  QueryClient,
  QueryObserverOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../contexts/AuthContext';
import type { Post, PostData, RelatedPost } from '../graphql/posts';
import { POST_BY_ID_QUERY } from '../graphql/posts';
import type { PostCommentsData } from '../graphql/comments';
import type { RequestKey } from '../lib/query';
import {
  getAllCommentsQuery,
  getPostByIdKey,
  StaleTime,
  updatePostCache,
  updatePostContentPreference,
} from '../lib/query';
import type { Connection } from '../graphql/common';
import { gqlClient } from '../graphql/common';
import { useMutationSubscription } from './mutationSubscription/useMutationSubscription';
import type { ContentPreferenceMutation } from './contentPreference/types';
import {
  contentPreferenceMutationMatcher,
  mutationKeyToContentPreferenceStatusMap,
} from './contentPreference/types';
import type { PropsParameters } from '../types';
import { useTranslation } from './translation/useTranslation';

interface UsePostByIdProps {
  id: string;
  options?: Partial<QueryObserverOptions<PostData>>;
}

interface UsePostById extends Pick<UseQueryResult, 'isError' | 'isLoading'> {
  post: Post;
  relatedCollectionPosts?: Connection<RelatedPost>;
}

export const invalidatePostCacheById = (
  client: QueryClient,
  id: string,
): void => {
  const postQueryKey = getPostByIdKey(id);
  const postCache = client.getQueryData(postQueryKey);
  if (postCache) {
    client.invalidateQueries({ queryKey: postQueryKey });
  }
};

export const removePostComments = (
  client: QueryClient,
  post: Post,
  commentId: string,
  parentId: string,
): void => {
  const keys = getAllCommentsQuery(post.id);
  const removeCachedComment = (data: PostCommentsData) => {
    if (!data) {
      return data;
    }
    const copy = { ...data };

    if (commentId !== parentId) {
      const parent = copy.postComments.edges.find(
        ({ node }) => node.id === parentId,
      );
      parent.node.children.edges = parent.node.children.edges.filter(
        ({ node }) => node.id !== commentId,
      );
      updatePostCache(client, post.id, { numComments: post.numComments - 1 });
      return copy;
    }

    const parent = copy.postComments.edges.find(
      ({ node }) => node.id === commentId,
    );
    const count = parent.node.children.edges.length + 1;
    const numComments = post.numComments - count;
    updatePostCache(client, post.id, { numComments });
    copy.postComments.edges = data.postComments.edges.filter(
      ({ node }) => node.id !== commentId,
    );

    return data;
  };

  keys.forEach((key) => {
    client.setQueryData(key, removeCachedComment);
  });
};

const usePostById = ({ id, options = {} }: UsePostByIdProps): UsePostById => {
  const { initialData, ...restOptions } = options;
  const { tokenRefreshed } = useAuthContext();
  const key = getPostByIdKey(id);
  const { fetchTranslations } = useTranslation({
    queryKey: key,
    queryType: 'post',
  });
  const {
    data: postById,
    isError,
    isPending,
  } = useQuery<PostData>({
    queryKey: key,
    queryFn: async () => {
      const res = await gqlClient.request<PostData>(POST_BY_ID_QUERY, { id });
      if (!res.post?.translation?.title) {
        fetchTranslations([res.post.id]);
      }

      return res;
    },
    ...restOptions,
    staleTime: StaleTime.Default,
    enabled: !!id && tokenRefreshed,
  });
  const post = postById || (options?.initialData as PostData);

  useMutationSubscription({
    matcher: contentPreferenceMutationMatcher,
    callback: ({ mutation, variables: mutationVariables, queryClient }) => {
      const currentData = queryClient.getQueryData(key);
      const [requestKey] = mutation.options.mutationKey as [
        RequestKey,
        ...unknown[],
      ];

      if (!currentData) {
        return;
      }

      const nextStatus = mutationKeyToContentPreferenceStatusMap[requestKey];

      const { id: entityId, entity } =
        mutationVariables as PropsParameters<ContentPreferenceMutation>;

      queryClient.setQueryData<PostData>(key, (data) => {
        const newPostData = updatePostContentPreference({
          data: data.post,
          status: nextStatus,
          entityId,
          entity,
        });

        return {
          ...data,
          post: newPostData,
        };
      });
    },
  });

  return useMemo(
    () => ({
      post: post?.post,
      relatedCollectionPosts: post?.relatedCollectionPosts,
      isError,
      isLoading: !post?.post && isPending,
    }),
    [post?.post, post?.relatedCollectionPosts, isError, isPending],
  );
};

export default usePostById;
