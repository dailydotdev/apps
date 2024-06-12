import { useContext, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import LogContext from '../../contexts/LogContext';
import AuthContext from '../../contexts/AuthContext';
import { PostData, UserVote } from '../../graphql/posts';
import { LogEvent } from '../../lib/log';
import { AuthTriggers } from '../../lib/auth';
import { PostLogEventFnOptions, postLogEvent } from '../../lib/feed';
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

      if (post?.userState?.vote === UserVote.Up) {
        logEvent(postLogEvent(LogEvent.RemovePostUpvote, post, logOptions));

        await cancelPostVote({ id: post.id });

        return;
      }

      logEvent(postLogEvent(LogEvent.UpvotePost, post, logOptions));

      await upvotePost({ id: post.id });
    },
    [cancelPostVote, showLogin, logEvent, upvotePost, user],
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

      if (post?.userState?.vote === UserVote.Down) {
        logEvent(postLogEvent(LogEvent.RemovePostDownvote, post, logOptions));

        await cancelPostVote({ id: post.id });

        return;
      }

      logEvent(postLogEvent(LogEvent.DownvotePost, post, logOptions));

      downvotePost({ id: post.id });
    },
    [cancelPostVote, downvotePost, showLogin, logEvent, user],
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
