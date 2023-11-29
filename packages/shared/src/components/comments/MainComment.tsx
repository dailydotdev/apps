import React, { ReactElement, useContext, useMemo } from 'react';
import EnableNotification from '../notifications/EnableNotification';
import CommentBox, { CommentBoxProps } from './CommentBox';
import SubComment from './SubComment';
import AuthContext from '../../contexts/AuthContext';
import { NotificationPromptSource } from '../../lib/analytics';
import {
  CommentMarkdownInput,
  CommentMarkdownInputProps,
} from '../fields/MarkdownInput/CommentMarkdownInput';
import { useComments } from '../../hooks/post';
import { SquadCommentJoinBanner } from '../squads/SquadCommentJoinBanner';
import { Squad } from '../../graphql/sources';
import { Comment } from '../../graphql/comments';
import usePersistentContext from '../../hooks/usePersistentContext';
import { SQUAD_COMMENT_JOIN_BANNER_KEY } from '../../graphql/squads';
import { useCommentEdit } from '../../hooks/post/useCommentEdit';

export interface MainCommentProps
  extends Omit<CommentBoxProps, 'onEdit' | 'onComment'> {
  permissionNotificationCommentId?: string;
  joinNotificationCommentId?: string;
  onCommented: CommentMarkdownInputProps['onCommented'];
}

const shouldShowBannerOnComment = (
  commentId: string,
  comment: Comment,
): boolean =>
  commentId === comment.id ||
  comment.children?.edges?.some(({ node }) => node.id === commentId);

export default function MainComment({
  className,
  comment,
  appendTooltipTo,
  permissionNotificationCommentId,
  joinNotificationCommentId,
  onCommented,
  ...props
}: MainCommentProps): ReactElement {
  const { user } = useContext(AuthContext);
  const showNotificationPermissionBanner = useMemo(
    () => shouldShowBannerOnComment(permissionNotificationCommentId, comment),
    [permissionNotificationCommentId, comment],
  );
  const [isJoinSquadBannerDismissed] = usePersistentContext(
    SQUAD_COMMENT_JOIN_BANNER_KEY,
    false,
  );
  const showJoinSquadBanner =
    useMemo(
      () => shouldShowBannerOnComment(joinNotificationCommentId, comment),
      [joinNotificationCommentId, comment],
    ) &&
    !props.post.source?.currentMember &&
    !isJoinSquadBannerDismissed;

  const { commentId, inputProps, onReplyTo } = useComments(props.post);
  const { inputProps: editProps, onEdit } = useCommentEdit();

  return (
    <section
      className="flex flex-col items-stretch rounded-24 border border-theme-divider-tertiary scroll-mt-16"
      data-testid="comment"
    >
      {!editProps && (
        <CommentBox
          {...props}
          comment={comment}
          parentId={comment.id}
          className={{ container: 'border-b' }}
          appendTooltipTo={appendTooltipTo}
          onComment={(selected, parentId) =>
            onReplyTo({
              username: selected.author.username,
              parentCommentId: parentId,
              commentId: selected.id,
            })
          }
          onEdit={(selected) => onEdit({ commentId: selected.id })}
        />
      )}
      {editProps && (
        <CommentMarkdownInput
          {...editProps}
          post={props.post}
          onCommented={(data, isNew) => {
            onEdit(null);
            onCommented(data, isNew);
          }}
          className={className}
        />
      )}
      {commentId === comment.id && (
        <CommentMarkdownInput
          {...inputProps}
          post={props.post}
          onCommented={(...params) => {
            onReplyTo(null);
            onCommented(...params);
          }}
          className={className}
        />
      )}
      {comment.children?.edges.map(({ node }) => (
        <SubComment
          {...props}
          key={node.id}
          comment={node}
          parentComment={comment}
          appendTooltipTo={appendTooltipTo}
          className={className}
          onCommented={onCommented}
        />
      ))}
      {showJoinSquadBanner && (
        <SquadCommentJoinBanner
          className={!comment.children?.edges?.length && 'mt-3'}
          squad={props.post?.source as Squad}
          analyticsOrigin={props.origin}
          post={props.post}
        />
      )}
      {!showJoinSquadBanner && showNotificationPermissionBanner && (
        <EnableNotification
          className={!comment.children?.edges?.length && 'mt-3'}
          source={NotificationPromptSource.NewComment}
          contentName={
            user?.id !== comment?.author.id ? comment?.author?.name : undefined
          }
        />
      )}
    </section>
  );
}
