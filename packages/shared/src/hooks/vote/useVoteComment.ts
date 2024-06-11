import { useCallback, useContext } from 'react';
import LogContext from '../../contexts/LogContext';
import AuthContext from '../../contexts/AuthContext';
import { Post, UserVote } from '../../graphql/posts';
import { AuthTriggers } from '../../lib/auth';
import { PostLogsEventFnOptions, postLogsEvent } from '../../lib/feed';
import {
  UserVoteEntity,
  UseVote,
  UseVoteProps,
  ToggleVoteProps,
  VoteEntityPayload,
} from './types';
import { useVote } from './useVote';
import { LogsEvent } from '../../lib/logs';

const prepareVoteCommentLogsOptions = ({
  payload,
  origin,
  opts,
}: ToggleVoteProps): PostLogsEventFnOptions => {
  const { extra, ...restOpts } = opts || {};

  return {
    ...restOpts,
    extra: { ...extra, origin, commentId: payload.id },
  };
};

export const useVoteComment = ({
  onMutate,
  variables,
}: Omit<UseVoteProps, 'entity'> = {}): Pick<
  UseVote<
    VoteEntityPayload & {
      post: Post;
    }
  >,
  'toggleUpvote' | 'toggleDownvote'
> => {
  const { user, showLogin } = useContext(AuthContext);
  const { trackEvent } = useContext(LogContext);

  const { upvote, downvote, cancelVote } = useVote({
    onMutate,
    entity: UserVoteEntity.Comment,
    variables,
  });

  return {
    toggleUpvote: useCallback(
      async ({ payload: comment, origin, opts }) => {
        if (!user) {
          showLogin({ trigger: AuthTriggers.CommentUpvote });

          return;
        }

        const logsOptions = prepareVoteCommentLogsOptions({
          payload: comment,
          origin,
          opts,
        });

        if (comment.userState?.vote === UserVote.Up) {
          trackEvent(
            postLogsEvent(
              LogsEvent.RemoveCommentUpvote,
              comment.post,
              logsOptions,
            ),
          );

          await cancelVote({ id: comment.id });

          return;
        }

        trackEvent(
          postLogsEvent(LogsEvent.UpvoteComment, comment.post, logsOptions),
        );

        await upvote({ id: comment.id });
      },
      [upvote, cancelVote, showLogin, trackEvent, user],
    ),
    toggleDownvote: useCallback(
      async ({ payload: comment, origin, opts }) => {
        if (!user) {
          showLogin({ trigger: AuthTriggers.CommentDownvote });

          return;
        }

        const logsOptions = prepareVoteCommentLogsOptions({
          payload: comment,
          origin,
          opts,
        });

        if (comment.userState?.vote === UserVote.Down) {
          trackEvent(
            postLogsEvent(
              LogsEvent.RemoveCommentDownvote,
              comment.post,
              logsOptions,
            ),
          );

          await cancelVote({ id: comment.id });

          return;
        }

        trackEvent(
          postLogsEvent(LogsEvent.DownvoteComment, comment.post, logsOptions),
        );

        await downvote({ id: comment.id });
      },
      [downvote, cancelVote, showLogin, trackEvent, user],
    ),
  };
};
