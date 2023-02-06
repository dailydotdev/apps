import request from 'graphql-request';
import { useMemo } from 'react';
import {
  QueryClient,
  QueryKey,
  QueryObserverOptions,
  useQuery,
} from 'react-query';
import { graphqlUrl } from '../lib/config';
import { useAuthContext } from '../contexts/AuthContext';
import { Post, PostData, POST_BY_ID_QUERY } from '../graphql/posts';

interface UsePostByIdProps {
  id: string;
  isFetchingNextPage?: boolean;
  options?: QueryObserverOptions<PostData>;
}

interface UsePostById {
  post: Post;
  isLoading: boolean;
  isFetched: boolean;
}

const POST_KEY = 'post';

export const getPostByIdKey = (id: string): QueryKey => [POST_KEY, id];

export const updatePostCache = (
  client: QueryClient,
  id: string,
  { id: _, ...postUpdate }: Partial<Post>,
): PostData =>
  client.setQueryData<PostData>(getPostByIdKey(id), (node) => ({
    post: {
      ...node.post,
      ...postUpdate,
    },
  }));

const usePostById = ({
  id,
  isFetchingNextPage,
  options = {},
}: UsePostByIdProps): UsePostById => {
  const { tokenRefreshed } = useAuthContext();
  const key = getPostByIdKey(id);
  const {
    data: postById,
    isLoading,
    isFetched,
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
      isFetched,
      isLoading: isLoading || isFetchingNextPage,
    }),
    [id, postById, isLoading, options, isFetched, isFetchingNextPage],
  );
};

export default usePostById;
