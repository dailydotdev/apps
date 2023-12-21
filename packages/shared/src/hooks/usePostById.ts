import request from 'graphql-request';
import { useMemo } from 'react';
import {
  QueryClient,
  QueryKey,
  QueryObserverOptions,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { graphqlUrl } from '../lib/config';
import { useAuthContext } from '../contexts/AuthContext';
import {
  Post,
  PostData,
  POST_BY_ID_QUERY,
  RelatedPost,
} from '../graphql/posts';
import { PostCommentsData } from '../graphql/comments';
import { generateQueryKey, RequestKey } from '../lib/query';
import { Connection } from '../graphql/common';

interface UsePostByIdProps {
  id: string;
  options?: QueryObserverOptions<PostData>;
}

interface UsePostById extends Pick<UseQueryResult, 'isError' | 'isFetched'> {
  post: Post;
  relatedCollectionPosts?: Connection<RelatedPost>;
  isPostLoadingOrFetching?: boolean;
}

const POST_KEY = 'post';

export const getPostByIdKey = (id: string): QueryKey => [POST_KEY, id];

export const updatePostCache = (
  client: QueryClient,
  id: string,
  postUpdate:
    | Partial<Omit<Post, 'id'>>
    | ((current: Post) => Partial<Omit<Post, 'id'>>),
): PostData => {
  const currentPost = client.getQueryData<PostData>(getPostByIdKey(id));

  if (!currentPost?.post) {
    return currentPost;
  }

  return client.setQueryData<PostData>(getPostByIdKey(id), (node) => {
    const update =
      typeof postUpdate === 'function' ? postUpdate(node.post) : postUpdate;

    return {
      post: {
        ...node.post,
        ...update,
        id: node.post.id,
      },
    };
  });
};

export const removePostComments = (
  client: QueryClient,
  post: Post,
  commentId: string,
  parentId: string,
): void => {
  const key = generateQueryKey(RequestKey.PostComments, null, post.id);
  client.setQueryData<PostCommentsData>(key, (data) => {
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
  });
};

const usePostById = ({ id, options = {} }: UsePostByIdProps): UsePostById => {
  const { tokenRefreshed } = useAuthContext();
  const key = getPostByIdKey(id);
  const {
    data: postById,
    isError,
    isFetched,
    isLoading,
    isFetching,
    isRefetching,
  } = useQuery<PostData>(
    key,
    () => request(graphqlUrl, POST_BY_ID_QUERY, { id }),
    {
      ...options,
      enabled: !!id && tokenRefreshed,
    },
  );
  const post = postById || (options?.initialData as PostData);

  return useMemo(
    () => ({
      post: post?.post,
      relatedCollectionPosts: post?.relatedCollectionPosts,
      isError,
      isFetched,
      isPostLoadingOrFetching: (isLoading || isFetching) && !isRefetching,
    }),
    [post, isError, isFetched, isLoading, isFetching, isRefetching],
  );
};

export default usePostById;
