import { useMutation } from 'react-query';
import request from 'graphql-request';
import { graphqlUrl } from '../lib/config';
import { CANCEL_DOWNVOTE_MUTATION, DOWNVOTE_MUTATION } from '../graphql/posts';
import { MutateFunc } from '../lib/query';

type UseDownvotePostProps<T> = {
  onDownvotePostMutate: MutateFunc<T>;
  onCancelPostDownvoteMutate: MutateFunc<T>;
};
type UseDownvotePost<T> = {
  downvotePost: (variables: T) => Promise<void>;
  cancelPostDownvote: (variables: T) => Promise<void>;
};

export const downvotePostMutationKey = ['post', 'mutation', 'downvote'];
export const cancelDownvotePostMutationKey = [
  'post',
  'mutation',
  'cancelDownvote',
];

const useDownvotePost = <T extends { id: string } = { id: string }>({
  onDownvotePostMutate,
  onCancelPostDownvoteMutate,
}: UseDownvotePostProps<T>): UseDownvotePost<T> => {
  const { mutateAsync: downvotePost } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(
    ({ id }) =>
      request(graphqlUrl, DOWNVOTE_MUTATION, {
        id,
      }),
    {
      mutationKey: downvotePostMutationKey,
      onMutate: onDownvotePostMutate,
      onError: (err, _, rollback) => rollback?.(),
    },
  );

  const { mutateAsync: cancelPostDownvote } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(
    ({ id }) =>
      request(graphqlUrl, CANCEL_DOWNVOTE_MUTATION, {
        id,
      }),
    {
      mutationKey: cancelDownvotePostMutationKey,
      onMutate: onCancelPostDownvoteMutate,
      onError: (err, _, rollback) => rollback?.(),
    },
  );

  return {
    downvotePost,
    cancelPostDownvote,
  };
};

export { useDownvotePost };
