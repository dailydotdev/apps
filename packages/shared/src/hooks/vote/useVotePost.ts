import { useContext, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import LogContext from '../../contexts/LogContext';
import AuthContext from '../../contexts/AuthContext';
import type { PostData } from '../../graphql/posts';
import { UserVote } from '../../graphql/posts';
import { LogEvent } from '../../lib/log';
import { AuthTriggers } from '../../lib/auth';
import type { PostLogEventFnOptions } from '../../lib/feed';
import { usePostLogEvent } from '../../lib/feed';
import {
  getPostByIdKey,
  updatePostCache as updateSinglePostCache,
} from '../../lib/query';
import type { UseVotePostProps, UseVotePost, ToggleVoteProps } from './types';
import { voteMutationHandlers, UserVoteEntity } from './types';
import { useVote } from './useVote';
import { useActiveFeedContext } from '../../contexts';

const prepareVotePostLogOptions = ({
  origin,
  opts,
}: ToggleVoteProps): PostLogEventFnOptions => {
  const { extra, ...restOpts } = opts || {};

  return {
    ...restOpts,
    extra: { ...extra, origin },
  };
};

const useVotePost = ({
  onMutate,
  variables,
}: UseVotePostProps = {}): UseVotePost => {
  const client = useQueryClient();
  const { user, showLogin } = useContext(AuthContext);
  const { logEvent } = useContext(LogContext);
  const postLogEvent = usePostLogEvent();
  const { logOpts } = useActiveFeedContext();
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

      const logOptions = prepareVotePostLogOptions({
        payload: post,
        origin,
        opts,
      });

      const finalLogOptions = logOpts
        ? { ...logOptions, ...logOpts }
        : logOptions;

      if (post?.userState?.vote === UserVote.Up) {
        logEvent(
          postLogEvent(LogEvent.RemovePostUpvote, post, finalLogOptions),
        );

        await cancelPostVote({ id: post.id });

        return;
      }

      logEvent(postLogEvent(LogEvent.UpvotePost, post, finalLogOptions));

      await upvotePost({ id: post.id });
    },
    [
      cancelPostVote,
      showLogin,
      logEvent,
      upvotePost,
      user,
      postLogEvent,
      logOpts,
    ],
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

      const logOptions = prepareVotePostLogOptions({
        payload: post,
        origin,
        opts,
      });

      const finalLogOptions = logOpts
        ? { ...logOptions, ...logOpts }
        : logOptions;

      if (post?.userState?.vote === UserVote.Down) {
        logEvent(
          postLogEvent(LogEvent.RemovePostDownvote, post, finalLogOptions),
        );

        await cancelPostVote({ id: post.id });

        return;
      }

      logEvent(postLogEvent(LogEvent.DownvotePost, post, finalLogOptions));

      downvotePost({ id: post.id });
    },
    [
      cancelPostVote,
      downvotePost,
      showLogin,
      logEvent,
      user,
      postLogEvent,
      logOpts,
    ],
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
