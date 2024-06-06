import { useCallback, useContext } from 'react';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import AuthContext from '../../contexts/AuthContext';
import { Post, UserVote } from '../../graphql/posts';
import { AuthTriggers } from '../../lib/auth';
import {
  PostAnalyticsEventFnOptions,
  postAnalyticsEvent,
} from '../../lib/feed';
import {
  UserVoteEntity,
  UseVote,
  UseVoteProps,
  ToggleVoteProps,
  VoteEntityPayload,
} from './types';
import { useVote } from './useVote';
import { AnalyticsEvent } from '../../lib/analytics';

const prepareVoteCommentAnalyticsOptions = ({
  payload,
  origin,
  opts,
}: ToggleVoteProps): PostAnalyticsEventFnOptions => {
  const { extra, ...restOpts } = opts || {};

  const analyticsOptions: PostAnalyticsEventFnOptions = {
    ...restOpts,
    extra: { ...extra, origin, commentId: payload.id },
  };

  return analyticsOptions;
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
  const { trackEvent } = useContext(AnalyticsContext);

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

        const analyticsOptions = prepareVoteCommentAnalyticsOptions({
          payload: comment,
          origin,
          opts,
        });

        if (comment.userState?.vote === UserVote.Up) {
          trackEvent(
            postAnalyticsEvent(
              AnalyticsEvent.RemoveCommentUpvote,
              comment.post,
              analyticsOptions,
            ),
          );

          await cancelVote({ id: comment.id });

          return;
        }

        trackEvent(
          postAnalyticsEvent(
            AnalyticsEvent.UpvoteComment,
            comment.post,
            analyticsOptions,
          ),
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

        const analyticsOptions = prepareVoteCommentAnalyticsOptions({
          payload: comment,
          origin,
          opts,
        });

        if (comment.userState?.vote === UserVote.Down) {
          trackEvent(
            postAnalyticsEvent(
              AnalyticsEvent.RemoveCommentDownvote,
              comment.post,
              analyticsOptions,
            ),
          );

          await cancelVote({ id: comment.id });

          return;
        }

        trackEvent(
          postAnalyticsEvent(
            AnalyticsEvent.DownvoteComment,
            comment.post,
            analyticsOptions,
          ),
        );

        await downvote({ id: comment.id });
      },
      [downvote, cancelVote, showLogin, trackEvent, user],
    ),
  };
};
