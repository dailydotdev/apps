import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import type { Comment } from '../../graphql/comments';
import type { CommentBoxProps } from './CommentBox';
import CommentBox from './CommentBox';
import type { CommentMarkdownInputProps } from '../fields/MarkdownInput/CommentMarkdownInput';
import { useComments } from '../../hooks/post';
import { useEditCommentProps } from '../../hooks/post/useEditCommentProps';
import EnableNotification from '../notifications/EnableNotification';
import { NotificationPromptSource } from '../../lib/log';
import { useAuthContext } from '../../contexts/AuthContext';
import { SourceType } from '../../graphql/sources';
import { useNotificationPreference } from '../../hooks/notifications';
import { NotificationType } from '../notifications/utils';
import { useNotificationCtaExperiment } from '../../hooks/notifications/useNotificationCtaExperiment';

const CommentInputOrModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "commentInputOrModal" */ './CommentInputOrModal'
    ),
);

export interface SubCommentProps
  extends Omit<CommentBoxProps, 'onEdit' | 'onComment'> {
  parentComment: Comment;
  upvoteNotificationCommentId?: string;
  onCommented: CommentMarkdownInputProps['onCommented'];
  isModalThread?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  extendTopConnector?: boolean;
}

function SubComment({
  comment,
  parentComment,
  upvoteNotificationCommentId,
  className,
  onCommented,
  isModalThread = false,
  isFirst = false,
  isLast = false,
  extendTopConnector = false,
  ...props
}: SubCommentProps): ReactElement {
  const { user } = useAuthContext();
  const { isEnabled: isNotificationCtaExperimentEnabled } =
    useNotificationCtaExperiment();
  const { inputProps, commentId, onReplyTo } = useComments(props.post);
  const { inputProps: editProps, onEdit } = useEditCommentProps();
  const showUpvoteNotificationPermissionBanner =
    isNotificationCtaExperimentEnabled &&
    upvoteNotificationCommentId === comment.id;
  const replyNotificationType =
    props.post.source?.type === SourceType.Squad
      ? NotificationType.SquadReply
      : NotificationType.CommentReply;
  const { subscribeNotification } = useNotificationPreference({ params: [] });

  const onEnableUpvoteNotification = async () => {
    if (!upvoteNotificationCommentId) {
      return;
    }

    await subscribeNotification({
      type: replyNotificationType,
      referenceId: upvoteNotificationCommentId,
    });
  };

  return (
    <>
      {!editProps && (
        <CommentBox
          {...props}
          key={comment.id}
          parentId={parentComment.id}
          comment={comment}
          onEdit={({ id, lastUpdatedAt }) =>
            onEdit({
              commentId: id,
              lastUpdatedAt,
              parentCommentId: parentComment.id,
            })
          }
          className={{
            container: classNames(
              'relative',
              isModalThread &&
                'rounded-none bg-transparent px-0 py-2 hover:bg-transparent',
              isModalThread && !isLast && 'mb-1',
            ),
            content: classNames('ml-[52px]', isModalThread && 'mt-1'),
            markdown: classNames(
              isModalThread &&
                '!text-[0.9375rem] [&_a]:!text-[0.9375rem] [&_li]:!text-[0.9375rem] [&_li]:!leading-[1.55] [&_p]:!text-[0.9375rem] [&_p]:!leading-[1.55]',
            ),
          }}
          onComment={(selected, parent) =>
            onReplyTo({
              username: comment.author.username,
              parentCommentId: parent,
              commentId: selected.id,
            })
          }
          isModalThread={isModalThread}
        >
          {!isModalThread && (
            <div
              className="absolute bottom-0 left-9 top-0 -ml-px w-0.5 bg-surface-float"
              data-testid="subcomment"
            />
          )}
          {isModalThread && (
            // Wrapper carries the testid for the modal-thread connector segments.
            // All children use absolute positioning relative to the nearest CommentBox (position: relative) ancestor.
            <div data-testid="subcomment">
              {isFirst && (
                // Bridges the 8px gap (-top-2 = -8px) between the parent connector line and this reply's avatar.
                // h-3 (12px) ensures overlap so there's no visual gap.
                <div
                  className={classNames(
                    'absolute left-5 w-px bg-accent-pepper-subtle',
                    extendTopConnector ? '-top-2 h-4' : '-top-2 h-3',
                  )}
                />
              )}
              {!isLast && (
                // Starts below avatar (top-10 = 40px = avatar height) and extends into next sibling's gap (-bottom-3 = -12px).
                // left-5 = avatar lane center (20px).
                <div className="absolute -bottom-3 left-5 top-10 w-px bg-accent-pepper-subtle" />
              )}
            </div>
          )}
        </CommentBox>
      )}
      {editProps && (
        <CommentInputOrModal
          {...editProps}
          post={props.post}
          onCommented={(data, isNew) => {
            onEdit(null);
            onCommented(data, isNew);
          }}
          onClose={() => onEdit(null)}
          className={{ input: className }}
        />
      )}
      {commentId === comment.id && (
        <div className={classNames(isModalThread && 'mt-2')}>
          <CommentInputOrModal
            {...inputProps}
            className={{ input: className }}
            post={props.post}
            onCommented={(...params) => {
              onReplyTo(null);
              onCommented(...params);
            }}
            onClose={() => onReplyTo(null)}
            replyToCommentId={commentId}
          />
        </div>
      )}
      {showUpvoteNotificationPermissionBanner && (
        <div className={classNames(isModalThread && 'relative mb-1')}>
          {isModalThread && !isLast && (
            // Keep modal-thread connector continuous when CTA is inserted
            // between reply items.
            <div className="pointer-events-none absolute -bottom-4 -top-4 left-5 w-px bg-accent-pepper-subtle" />
          )}
          <EnableNotification
            className={!comment.children?.edges?.length && 'mt-3'}
            source={NotificationPromptSource.CommentUpvote}
            contentName={
              user?.id !== comment?.author.id
                ? comment?.author?.name
                : undefined
            }
            onEnableAction={onEnableUpvoteNotification}
          />
        </div>
      )}
    </>
  );
}

export default SubComment;
