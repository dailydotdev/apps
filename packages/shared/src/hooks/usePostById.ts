import request from 'graphql-request';
import { useMemo } from 'react';
import { QueryObserverOptions, useQuery } from 'react-query';
import { GraphQLError } from 'graphql';
import { apiUrl } from '../lib/config';
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
}

interface ResponseError {
  response: {
    errors: GraphQLError[];
  };
}

const usePostById = ({
  id,
  isFetchingNextPage,
  options = {},
}: UsePostByIdProps): UsePostById => {
  const { tokenRefreshed } = useAuthContext();
  const {
    data: postById,
    isLoading,
    isFetched,
  } = useQuery<PostData>(
    ['post', id],
    () => request(`${apiUrl}/graphql`, POST_BY_ID_QUERY, { id }),
    {
      ...options,
      enabled: !!id && tokenRefreshed,
      onError: (err: ResponseError) => {
        if (!err?.response?.errors?.length) {
          return;
        }
        // eslint-disable-next-line no-console
        console.error(err.response.errors[0]);
      },
    },
  );

  const post = postById || (options?.initialData as PostData);

  return useMemo(
    () => ({
      post: post?.post,
      isLoading: isLoading || !isFetched || isFetchingNextPage,
    }),
    [postById, isLoading],
  );
};

export default usePostById;
