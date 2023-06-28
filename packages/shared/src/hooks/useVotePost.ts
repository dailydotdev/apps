import { useMutation } from 'react-query';
import { graphqlUrl } from '../lib/config';
import {
  CANCEL_DOWNVOTE_MUTATION,
  CANCEL_UPVOTE_MUTATION,
  DOWNVOTE_MUTATION,
  Post,
  UPVOTE_MUTATION,
} from '../graphql/posts';
import { MutateFunc } from '../lib/query';
import { useRequestProtocol } from './useRequestProtocol';

export type UseVotePostProps<T> = {
  onUpvotePostMutate?: MutateFunc<T>;
  onCancelPostUpvoteMutate?: MutateFunc<T>;
  onDownvotePostMutate?: MutateFunc<T>;
  onCancelPostDownvoteMutate?: MutateFunc<T>;
};
export type UseVotePost<T> = {
  upvotePost: (variables: T) => Promise<void>;
  cancelPostUpvote: (variables: T) => Promise<void>;
  downvotePost: (variables: T) => Promise<void>;
  cancelPostDownvote: (variables: T) => Promise<void>;
};

export const upvotePostMutationKey = ['post', 'mutation', 'upvote'];
export const cancelUpvotePostMutationKey = ['post', 'mutation', 'cancelUpvote'];
export const downvotePostMutationKey = ['post', 'mutation', 'downvote'];
export const cancelDownvotePostMutationKey = [
  'post',
  'mutation',
  'cancelDownvote',
];

export const mutationHandlers: Record<
  'upvote' | 'cancelUpvote' | 'downvote' | 'cancelDownvote',
  (post: Post) => Partial<Post>
> = {
  upvote: (post) => ({
    upvoted: true,
    downvoted: false,
    numUpvotes: post.numUpvotes + 1,
  }),
  cancelUpvote: (post) => ({
    upvoted: false,
    numUpvotes: post.numUpvotes - 1,
  }),
  downvote: (post) => ({
    downvoted: true,
    upvoted: false,
    numUpvotes: post.upvoted ? post.numUpvotes - 1 : post.numUpvotes,
  }),
  cancelDownvote: () => ({
    downvoted: false,
  }),
};

const useVotePost = <T extends { id: string } = { id: string }>({
  onUpvotePostMutate,
  onCancelPostUpvoteMutate,
  onDownvotePostMutate,
  onCancelPostDownvoteMutate,
}: UseVotePostProps<T> = {}): UseVotePost<T> => {
  const { requestMethod } = useRequestProtocol();
  const { mutateAsync: upvotePost } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(
    ({ id }) =>
      requestMethod(graphqlUrl, UPVOTE_MUTATION, {
        id,
      }),
    {
      mutationKey: upvotePostMutationKey,
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
      requestMethod(graphqlUrl, CANCEL_UPVOTE_MUTATION, {
        id,
      }),
    {
      mutationKey: cancelUpvotePostMutationKey,
      onMutate: onCancelPostUpvoteMutate,
      onError: (err, _, rollback) => rollback?.(),
    },
  );

  const { mutateAsync: downvotePost } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(
    ({ id }) =>
      requestMethod(graphqlUrl, DOWNVOTE_MUTATION, {
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
      requestMethod(graphqlUrl, CANCEL_DOWNVOTE_MUTATION, {
        id,
      }),
    {
      mutationKey: cancelDownvotePostMutationKey,
      onMutate: onCancelPostDownvoteMutate,
      onError: (err, _, rollback) => rollback?.(),
    },
  );

  return {
    upvotePost,
    cancelPostUpvote,
    downvotePost,
    cancelPostDownvote,
  };
};

export { useVotePost };
