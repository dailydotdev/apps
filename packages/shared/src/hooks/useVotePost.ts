import { useMutation, useQueryClient } from 'react-query';
import { useCallback, useContext } from 'react';
import { graphqlUrl } from '../lib/config';
import {
  Post,
  PostData,
  ReadHistoryPost,
  UserPostVote,
  VOTE_POST_MUTATION,
} from '../graphql/posts';
import { useRequestProtocol } from './useRequestProtocol';
import AuthContext from '../contexts/AuthContext';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { PostAnalyticsEventFnOptions, postAnalyticsEvent } from '../lib/feed';
import { AnalyticsEvent, Origin } from '../lib/analytics';
import { AuthTriggers } from '../lib/auth';
import {
  getPostByIdKey,
  updatePostCache as updateSinglePostCache,
} from './usePostById';
import { UseMutationMatcher } from './mutationSubscription/types';

export type ToggleVoteProps = {
  origin: Origin;
  post: Post | ReadHistoryPost;
  opts?: PostAnalyticsEventFnOptions;
};

export type VoteProps = {
  id: string;
};

export type UseVotePost = {
  upvotePost: (props: VoteProps) => Promise<void>;
  downvotePost: (props: VoteProps) => Promise<void>;
  cancelPostVote: (props: VoteProps) => Promise<void>;
  toggleUpvote: (props: ToggleVoteProps) => Promise<void>;
  toggleDownvote: (props: ToggleVoteProps) => Promise<void>;
};

export type UseVotePostMutationProps = {
  id: string;
  vote: UserPostVote;
};

export type UseVotePostRollback = () => void;

export type UseVotePostProps = {
  onMutate?: (
    props: UseVotePostMutationProps,
  ) => UseVotePostRollback | undefined;
  variables?: unknown;
};

export const upvoteMutationKey = ['post', 'mutation'];

export const voteMutationMatcher: UseMutationMatcher = ({ mutation }) => {
  return (
    mutation.state.status === 'success' &&
    mutation.options.mutationKey?.toString() === upvoteMutationKey.toString()
  );
};

export const voteMutationHandlers: Record<
  UserPostVote,
  (post: Post | ReadHistoryPost) => Partial<Post>
> = {
  [UserPostVote.Up]: (post) => ({
    numUpvotes: post.numUpvotes + 1,
    userState: {
      ...post?.userState,
      vote: UserPostVote.Up,
    },
  }),
  [UserPostVote.Down]: (post) => ({
    numUpvotes:
      post?.userState?.vote === UserPostVote.Up
        ? post.numUpvotes - 1
        : post.numUpvotes,
    userState: {
      ...post?.userState,
      vote: UserPostVote.Down,
    },
  }),
  [UserPostVote.None]: (post) => ({
    numUpvotes:
      post.userState?.vote === UserPostVote.Up
        ? post.numUpvotes - 1
        : post.numUpvotes,
    userState: {
      ...post?.userState,
      vote: UserPostVote.None,
    },
  }),
};

const useVotePost = ({
  onMutate,
  variables,
}: UseVotePostProps = {}): UseVotePost => {
  const { requestMethod } = useRequestProtocol();
  const client = useQueryClient();
  const { user, showLogin } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const defaultOnMutate = ({ id, vote }) => {
    const mutationHandler = voteMutationHandlers[vote];

    if (!mutationHandler) {
      return undefined;
    }

    const previousVote = client.getQueryData<PostData>(getPostByIdKey(id))?.post
      ?.userState?.vote;
    updateSinglePostCache(client, id, mutationHandler);

    return () => {
      const rollbackMutationHandler = voteMutationHandlers[previousVote];

      if (!rollbackMutationHandler) {
        return;
      }

      updateSinglePostCache(client, id, rollbackMutationHandler);
    };
  };

  const { mutateAsync: votePost, isLoading } = useMutation(
    ({ id, vote }: UseVotePostMutationProps) => {
      return requestMethod(graphqlUrl, VOTE_POST_MUTATION, {
        id,
        vote,
      });
    },
    {
      mutationKey: variables
        ? [...upvoteMutationKey, variables]
        : upvoteMutationKey,
      onMutate: onMutate ?? defaultOnMutate,
      onError: (err, _, rollback?: () => void) => rollback?.(),
    },
  );

  const upvotePost = useCallback(
    ({ id }: VoteProps) => {
      return votePost({ id, vote: UserPostVote.Up });
    },
    [votePost],
  );
  const downvotePost = useCallback(
    ({ id }: VoteProps) => {
      return votePost({ id, vote: UserPostVote.Down });
    },
    [votePost],
  );
  const cancelPostVote = useCallback(
    ({ id }: VoteProps) => {
      return votePost({ id, vote: UserPostVote.None });
    },
    [votePost],
  );

  const toggleUpvote = useCallback(
    async ({ post, origin, opts }: ToggleVoteProps) => {
      if (!post || isLoading) {
        return;
      }

      if (!user) {
        showLogin(AuthTriggers.Upvote);

        return;
      }

      if (post?.userState?.vote === UserPostVote.Up) {
        trackEvent(
          postAnalyticsEvent(AnalyticsEvent.RemovePostUpvote, post, {
            ...opts,
            extra: { ...opts?.extra, origin },
          }),
        );

        await cancelPostVote({ id: post.id });

        return;
      }

      trackEvent(
        postAnalyticsEvent(AnalyticsEvent.UpvotePost, post, {
          ...opts,
          extra: { ...opts?.extra, origin },
        }),
      );

      await upvotePost({ id: post.id });
    },
    [cancelPostVote, showLogin, trackEvent, upvotePost, user, isLoading],
  );

  const toggleDownvote = useCallback(
    async ({ post, origin, opts }: ToggleVoteProps) => {
      if (!post || isLoading) {
        return;
      }

      if (!user) {
        showLogin(AuthTriggers.Downvote);

        return;
      }

      if (post?.userState?.vote === UserPostVote.Down) {
        trackEvent(
          postAnalyticsEvent(AnalyticsEvent.RemovePostDownvote, post, {
            ...opts,
            extra: { ...opts?.extra, origin },
          }),
        );

        await cancelPostVote({ id: post.id });

        return;
      }

      trackEvent(
        postAnalyticsEvent(AnalyticsEvent.DownvotePost, post, {
          ...opts,
          extra: { ...opts?.extra, origin },
        }),
      );

      downvotePost({ id: post.id });
    },
    [cancelPostVote, downvotePost, showLogin, trackEvent, user, isLoading],
  );

  return {
    upvotePost,
    downvotePost,
    cancelPostVote,
    toggleUpvote,
    toggleDownvote,
  };
};

export { useVotePost };
