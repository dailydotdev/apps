import React, { ReactElement, useContext } from 'react';
import EnableNotification from '../notifications/EnableNotification';
import CommentBox, { CommentBoxProps } from './CommentBox';
import SubComment from './SubComment';
import AuthContext from '../../contexts/AuthContext';
import { NotificationPromptSource } from '../../lib/analytics';
import { CommentMarkdownInput } from '../fields/MarkdownInput/CommentMarkdownInput';
import { useComments } from '../../hooks/post';

export interface MainCommentProps
  extends Omit<CommentBoxProps, 'onEdit' | 'onComment'> {
  permissionNotificationCommentId?: string;
}

export default function MainComment({
  className,
  comment,
  appendTooltipTo,
  permissionNotificationCommentId,
  onCommented,
  ...props
}: MainCommentProps): ReactElement {
  const { user } = useContext(AuthContext);
  const shouldShowBanner =
    permissionNotificationCommentId === comment.id ||
    comment.children?.edges?.some(
      ({ node }) => node.id === permissionNotificationCommentId,
    );

  const { replyComment, inputProps, onReplyTo } = useComments();
  const onSuccess: typeof inputProps.onCommented = (newComment, isNew) => {
    onReplyTo(null);
    onCommented(newComment, isNew);
  };

  return (
    <section
      className="flex flex-col items-stretch rounded-24 border border-theme-divider-tertiary scroll-mt-16"
      data-testid="comment"
    >
      {!inputProps?.editCommentId && (
        <CommentBox
          {...props}
          comment={comment}
          parentId={comment.id}
          className={{ container: 'border-b' }}
          appendTooltipTo={appendTooltipTo}
          onComment={(selected, parentId) => onReplyTo([selected, parentId])}
          onEdit={(selected) => onReplyTo([selected, null, true])}
        />
      )}
      {replyComment?.id === comment.id && (
        <CommentMarkdownInput
          {...inputProps}
          postId={props.post.id}
          onCommented={onSuccess}
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
        />
      ))}
      {shouldShowBanner && (
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
