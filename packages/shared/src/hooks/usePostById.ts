import request from 'graphql-request';
import { useMemo } from 'react';
import { QueryObserverOptions, useQuery } from 'react-query';
import { graphqlUrl } from '../lib/config';
import { useAuthContext } from '../contexts/AuthContext';
import { Post, PostData, POST_BY_ID_QUERY } from '../graphql/posts';
import { isNullOrUndefined } from '../lib/func';

interface UsePostByIdProps {
  id: string;
  isFetchingNextPage?: boolean;
  options?: QueryObserverOptions<PostData>;
}

interface UsePostById {
  post: Post;
  isLoading: boolean;
}

const usePostById = ({
  id,
  isFetchingNextPage,
  options = {},
}: UsePostByIdProps): UsePostById => {
  const { tokenRefreshed } = useAuthContext();
  const isEnabled = !!id && tokenRefreshed;
  const {
    data: postById,
    isLoading,
    isFetched,
  } = useQuery<PostData>(
    ['post', id],
    () => request(graphqlUrl, POST_BY_ID_QUERY, { id }),
    {
      ...options,
      enabled: isNullOrUndefined(options.enabled)
        ? isEnabled
        : isEnabled && options.enabled,
    },
  );

  const post = postById || (options?.initialData as PostData);

  return useMemo(
    () => ({
      post: post?.post,
      isLoading: isLoading || !isFetched || isFetchingNextPage,
    }),
    [id, postById, isLoading, options, isFetchingNextPage],
  );
};

export default usePostById;
