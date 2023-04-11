import request from 'graphql-request';
import { useMemo } from 'react';
import {
  QueryClient,
  QueryKey,
  QueryObserverOptions,
  useQuery,
  UseQueryResult,
} from 'react-query';
import { graphqlUrl } from '../lib/config';
import { useAuthContext } from '../contexts/AuthContext';
import { Post, PostData, POST_BY_ID_QUERY } from '../graphql/posts';

interface UsePostByIdProps {
  id: string;
  options?: QueryObserverOptions<PostData>;
}

interface UsePostById {
  post: Post;
  query: UseQueryResult;
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

const usePostById = ({ id, options = {} }: UsePostByIdProps): UsePostById => {
  const { tokenRefreshed } = useAuthContext();
  const key = getPostByIdKey(id);
  const query = useQuery<PostData>(
    key,
    () => request(graphqlUrl, POST_BY_ID_QUERY, { id }),
    {
      ...options,
      enabled: !!id && tokenRefreshed,
    },
  );
  const { data: postById } = query;
  const post = postById || (options?.initialData as PostData);

  return useMemo(() => ({ post: post?.post, query }), [query]);
};

export default usePostById;
