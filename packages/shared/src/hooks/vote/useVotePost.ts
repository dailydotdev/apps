import { useContext, useCallback } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import AuthContext from '../../contexts/AuthContext';
import { PostData, UserVote } from '../../graphql/posts';
import { AnalyticsEvent } from '../../lib/analytics';
import { AuthTriggers } from '../../lib/auth';
import { graphqlUrl } from '../../lib/config';
import {
  PostAnalyticsEventFnOptions,
  postAnalyticsEvent,
} from '../../lib/feed';
import {
  getPostByIdKey,
  updatePostCache as updateSinglePostCache,
} from '../usePostById';
import { useRequestProtocol } from '../useRequestProtocol';
import {
  UseVotePostProps,
  UseVotePost,
  voteMutationHandlers,
  UseVoteMutationProps,
  upvoteMutationKey,
  VoteProps,
  ToggleVoteProps,
  UserVoteEntity,
} from './types';
import { VOTE_MUTATION } from '../../graphql/users';

const prepareVotePostAnalyticsOptions = ({
  origin,
  opts,
}: ToggleVoteProps): PostAnalyticsEventFnOptions => {
  const { extra, ...restOpts } = opts || {};

  const analyticsOptions: PostAnalyticsEventFnOptions = {
    ...restOpts,
    extra: { ...extra, origin },
  };

  return analyticsOptions;
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

  const { mutateAsync: votePost } = useMutation(
    ({ id, vote }: UseVoteMutationProps) => {
      return requestMethod(graphqlUrl, VOTE_MUTATION, {
        id,
        vote,
        entity: UserVoteEntity.Post,
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
      return votePost({ id, vote: UserVote.Up });
    },
    [votePost],
  );
  const downvotePost = useCallback(
    ({ id }: VoteProps) => {
      return votePost({ id, vote: UserVote.Down });
    },
    [votePost],
  );
  const cancelPostVote = useCallback(
    ({ id }: VoteProps) => {
      return votePost({ id, vote: UserVote.None });
    },
    [votePost],
  );

  const toggleUpvote: UseVotePost['toggleUpvote'] = useCallback(
    async ({ payload: post, origin, opts }) => {
      if (!post) {
        return;
      }

      if (!user) {
        showLogin({ trigger: AuthTriggers.Upvote });

        return;
      }

      const analyticsOptions = prepareVotePostAnalyticsOptions({
        payload: post,
        origin,
        entity: UserVoteEntity.Post,
        opts,
      });

      if (post?.userState?.vote === UserVote.Up) {
        trackEvent(
          postAnalyticsEvent(
            AnalyticsEvent.RemovePostUpvote,
            post,
            analyticsOptions,
          ),
        );

        await cancelPostVote({ id: post.id, entity: UserVoteEntity.Post });

        return;
      }

      trackEvent(
        postAnalyticsEvent(AnalyticsEvent.UpvotePost, post, analyticsOptions),
      );

      await upvotePost({ id: post.id, entity: UserVoteEntity.Post });
    },
    [cancelPostVote, showLogin, trackEvent, upvotePost, user],
  );

  const toggleDownvote: UseVotePost['toggleDownvote'] = useCallback(
    async ({ payload: post, origin, opts }) => {
      if (!post) {
        return;
      }

      if (!user) {
        showLogin({ trigger: AuthTriggers.Downvote });

        return;
      }

      const analyticsOptions = prepareVotePostAnalyticsOptions({
        payload: post,
        origin,
        entity: UserVoteEntity.Post,
        opts,
      });

      if (post?.userState?.vote === UserVote.Down) {
        trackEvent(
          postAnalyticsEvent(
            AnalyticsEvent.RemovePostDownvote,
            post,
            analyticsOptions,
          ),
        );

        await cancelPostVote({ id: post.id, entity: UserVoteEntity.Post });

        return;
      }

      trackEvent(
        postAnalyticsEvent(AnalyticsEvent.DownvotePost, post, analyticsOptions),
      );

      downvotePost({ id: post.id, entity: UserVoteEntity.Post });
    },
    [cancelPostVote, downvotePost, showLogin, trackEvent, user],
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
