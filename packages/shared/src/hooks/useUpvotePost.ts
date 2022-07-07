import { useMutation } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '../lib/config';
import { CANCEL_UPVOTE_MUTATION, UPVOTE_MUTATION } from '../graphql/posts';
import { MutateFunc } from '../lib/query';

type UseUpvotePostParams<T> = {
  onUpvotePostMutate: MutateFunc<T>;
  onCancelPostUpvoteMutate: MutateFunc<T>;
};
type UseUpvotePostRet<T> = {
  upvotePost: (variables: T) => Promise<void>;
  cancelPostUpvote: (variables: T) => Promise<void>;
};

export default function useUpvotePost<
  T extends { id: string } = { id: string },
>({
  onUpvotePostMutate,
  onCancelPostUpvoteMutate,
}: UseUpvotePostParams<T>): UseUpvotePostRet<T> {
  const { mutateAsync: upvotePost } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(
    ({ id }) =>
      request(`${apiUrl}/graphql`, UPVOTE_MUTATION, {
        id,
      }),
    {
      onMutate: onUpvotePostMutate,
      onError: (err, _, rollback) => rollback?.(),
    },
  );

  const { mutateAsync: cancelPostUpvote } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(
    ({ id }) =>
      request(`${apiUrl}/graphql`, CANCEL_UPVOTE_MUTATION, {
        id,
      }),
    {
      onMutate: onCancelPostUpvoteMutate,
      onError: (err, _, rollback) => rollback?.(),
    },
  );

  return {
    upvotePost,
    cancelPostUpvote,
  };
}
