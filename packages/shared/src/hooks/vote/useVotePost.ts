import { useContext, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import LogContext from '../../contexts/LogContext';
import AuthContext from '../../contexts/AuthContext';
import { PostData, UserVote } from '../../graphql/posts';
import { LogsEvent } from '../../lib/logs';
import { AuthTriggers } from '../../lib/auth';
import { PostLogsEventFnOptions, postLogsEvent } from '../../lib/feed';
import {
  getPostByIdKey,
  updatePostCache as updateSinglePostCache,
} from '../usePostById';
import {
  UseVotePostProps,
  UseVotePost,
  voteMutationHandlers,
  ToggleVoteProps,
  UserVoteEntity,
} from './types';
import { useVote } from './useVote';

const prepareVotePostLogsOptions = ({
  origin,
  opts,
}: ToggleVoteProps): PostLogsEventFnOptions => {
  const { extra, ...restOpts } = opts || {};

  const logsOptions: PostLogsEventFnOptions = {
    ...restOpts,
    extra: { ...extra, origin },
  };

  return logsOptions;
};

const useVotePost = ({
  onMutate,
  variables,
}: UseVotePostProps = {}): UseVotePost => {
  const client = useQueryClient();
  const { user, showLogin } = useContext(AuthContext);
  const { trackEvent } = useContext(LogContext);
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

  const {
    upvote: upvotePost,
    downvote: downvotePost,
    cancelVote: cancelPostVote,
  } = useVote({
    onMutate: onMutate || defaultOnMutate,
    entity: UserVoteEntity.Post,
    variables,
  });

  const toggleUpvote: UseVotePost['toggleUpvote'] = useCallback(
    async ({ payload: post, origin, opts }) => {
      if (!post) {
        return;
      }

      if (!user) {
        showLogin({ trigger: AuthTriggers.Upvote });

        return;
      }

      const logsOptions = prepareVotePostLogsOptions({
        payload: post,
        origin,
        opts,
      });

      if (post?.userState?.vote === UserVote.Up) {
        trackEvent(
          postLogsEvent(LogsEvent.RemovePostUpvote, post, logsOptions),
        );

        await cancelPostVote({ id: post.id });

        return;
      }

      trackEvent(postLogsEvent(LogsEvent.UpvotePost, post, logsOptions));

      await upvotePost({ id: post.id });
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

      const logsOptions = prepareVotePostLogsOptions({
        payload: post,
        origin,
        opts,
      });

      if (post?.userState?.vote === UserVote.Down) {
        trackEvent(
          postLogsEvent(LogsEvent.RemovePostDownvote, post, logsOptions),
        );

        await cancelPostVote({ id: post.id });

        return;
      }

      trackEvent(postLogsEvent(LogsEvent.DownvotePost, post, logsOptions));

      downvotePost({ id: post.id });
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
