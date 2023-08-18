import { useMutation } from 'react-query';
import { useContext } from 'react';
import { graphqlUrl } from '../lib/config';
import {
  Post,
  ReadHistoryPost,
  UserPostVote,
  VOTE_POST_MUTATION,
} from '../graphql/posts';
import { MutateFunc } from '../lib/query';
import { useRequestProtocol } from './useRequestProtocol';
import useUpdatePost from './useUpdatePost';
import AuthContext from '../contexts/AuthContext';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../lib/feed';
import { AnalyticsEvent, Origin } from '../lib/analytics';
import { AuthTriggers } from '../lib/auth';

export type UseVotePostProps<T> = {
  onUpvotePostMutate?: MutateFunc<T>;
  onCancelPostUpvoteMutate?: MutateFunc<T>;
  onDownvotePostMutate?: MutateFunc<T>;
  onCancelPostDownvoteMutate?: MutateFunc<T>;
  toggleUpvote?: (post: Post | ReadHistoryPost) => MutateFunc<T>;
  toggleDownvote?: (post: Post | ReadHistoryPost) => MutateFunc<T>;
};
export type UseVotePost<T> = {
  upvotePost: (variables: T) => Promise<void>;
  cancelPostUpvote: (variables: T) => Promise<void>;
  downvotePost: (variables: T) => Promise<void>;
  cancelPostDownvote: (variables: T) => Promise<void>;
  toggleUpvote: (post: Post | ReadHistoryPost) => Promise<void>;
  toggleDownvote: (post: Post | ReadHistoryPost) => Promise<void>;
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
  (post: Post | ReadHistoryPost) => Partial<Post>
> = {
  upvote: (post) => ({
    numUpvotes: post.numUpvotes + 1,
    userState: {
      ...post.userState,
      vote: UserPostVote.Up,
    },
  }),
  cancelUpvote: (post) => ({
    numUpvotes: post.numUpvotes - 1,
    userState: {
      ...post.userState,
      vote: UserPostVote.None,
    },
  }),
  downvote: (post) => ({
    numUpvotes:
      post.userState?.vote === UserPostVote.Down
        ? post.numUpvotes - 1
        : post.numUpvotes,
    userState: {
      ...post.userState,
      vote: UserPostVote.Down,
    },
  }),
  cancelDownvote: (post) => ({
    userState: {
      ...post.userState,
      vote: UserPostVote.None,
    },
  }),
};

const useVotePost = <T extends { id: string } = { id: string }>({
  onUpvotePostMutate,
  onCancelPostUpvoteMutate,
  onDownvotePostMutate,
  onCancelPostDownvoteMutate,
}: UseVotePostProps<T> = {}): UseVotePost<T> => {
  const { requestMethod } = useRequestProtocol();
  const { updatePost } = useUpdatePost();
  const { user, showLogin } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const { mutateAsync: upvotePost } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(
    ({ id }) =>
      requestMethod(graphqlUrl, VOTE_POST_MUTATION, {
        id,
        vote: UserPostVote.Up,
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
      requestMethod(graphqlUrl, VOTE_POST_MUTATION, {
        id,
        vote: UserPostVote.None,
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
      requestMethod(graphqlUrl, VOTE_POST_MUTATION, {
        id,
        vote: UserPostVote.Down,
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
      requestMethod(graphqlUrl, VOTE_POST_MUTATION, {
        id,
        vote: UserPostVote.None,
      }),
    {
      mutationKey: cancelDownvotePostMutationKey,
      onMutate: onCancelPostDownvoteMutate,
      onError: (err, _, rollback) => rollback?.(),
    },
  );

  const toggleUpvote = (post) => {
    if (user) {
      if (post?.userState?.vote === UserPostVote.Up) {
        trackEvent(
          postAnalyticsEvent(AnalyticsEvent.RemovePostUpvote, post, {
            extra: { origin: Origin.EngagementLoopVote },
          }),
        );
        return cancelPostUpvote({ id: post.id });
      }
      if (post) {
        trackEvent(
          postAnalyticsEvent(AnalyticsEvent.UpvotePost, post, {
            extra: { origin: Origin.EngagementLoopVote },
          }),
        );
        return upvotePost({ id: post.id });
      }
    } else {
      showLogin(AuthTriggers.Upvote);
    }
    return undefined;
  };

  const toggleDownvote = (post) => {
    if (!post) {
      return;
    }

    if (!user) {
      showLogin(AuthTriggers.Downvote);

      return;
    }

    if (post?.userState?.vote === UserPostVote.Down) {
      trackEvent(
        postAnalyticsEvent(AnalyticsEvent.RemovePostDownvote, post, {
          extra: { origin: Origin.EngagementLoopVote },
        }),
      );

      cancelPostDownvote({ id: post.id });
    } else {
      trackEvent(
        postAnalyticsEvent(AnalyticsEvent.DownvotePost, post, {
          extra: { origin: Origin.EngagementLoopVote },
        }),
      );

      downvotePost({ id: post.id });
    }
  };

  return {
    upvotePost,
    cancelPostUpvote,
    downvotePost,
    cancelPostDownvote,
    toggleUpvote,
    toggleDownvote,
  };
};

export { useVotePost };
