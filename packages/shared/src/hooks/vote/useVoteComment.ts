import { useCallback, useContext } from 'react';
import LogContext from '../../contexts/LogContext';
import AuthContext from '../../contexts/AuthContext';
import type { Post } from '../../graphql/posts';
import { UserVote } from '../../graphql/posts';
import { AuthTriggers } from '../../lib/auth';
import type { PostLogEventFnOptions } from '../../lib/feed';
import { postLogEvent } from '../../lib/feed';
import type {
  UseVote,
  UseVoteProps,
  ToggleVoteProps,
  VoteEntityPayload,
} from './types';
import { UserVoteEntity } from './types';
import { useVote } from './useVote';
import { LogEvent } from '../../lib/log';

const prepareVoteCommentLogsOptions = ({
  payload,
  origin,
  opts,
}: ToggleVoteProps): PostLogEventFnOptions => {
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
  const { logEvent } = useContext(LogContext);

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
          logEvent(
            postLogEvent(
              LogEvent.RemoveCommentUpvote,
              comment.post,
              logsOptions,
            ),
          );

          await cancelVote({ id: comment.id });

          return;
        }

        logEvent(
          postLogEvent(LogEvent.UpvoteComment, comment.post, logsOptions),
        );

        await upvote({ id: comment.id });
      },
      [upvote, cancelVote, showLogin, logEvent, user],
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
          logEvent(
            postLogEvent(
              LogEvent.RemoveCommentDownvote,
              comment.post,
              logsOptions,
            ),
          );

          await cancelVote({ id: comment.id });

          return;
        }

        logEvent(
          postLogEvent(LogEvent.DownvoteComment, comment.post, logsOptions),
        );

        await downvote({ id: comment.id });
      },
      [downvote, cancelVote, showLogin, logEvent, user],
    ),
  };
};
