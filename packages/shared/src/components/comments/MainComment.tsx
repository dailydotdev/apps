import React, { ReactElement } from 'react';
import EnableNotification from '../notifications/EnableNotification';
import { NotificationPromptSource } from '../../hooks/useEnableNotification';
import CommentBox, { CommentBoxProps } from './CommentBox';

export interface MainCommentProps extends CommentBoxProps {
  permissionNotificationCommentId?: string;
}

export default function MainComment({
  className,
  comment,
  permissionNotificationCommentId,
  ...props
}: MainCommentProps): ReactElement {
  const shouldShowBanner =
    permissionNotificationCommentId === comment.id ||
    comment.children?.edges?.some(
      ({ node }) => node.id === permissionNotificationCommentId,
    );

  return (
    <section
      className="flex flex-col items-stretch rounded-24 border border-theme-divider-tertiary scroll-mt-16"
      data-testid="comment"
    >
      <CommentBox {...props} comment={comment} parentId={comment.id} />
      {comment.children?.edges.map(({ node }) => (
        <CommentBox
          {...props}
          key={node.id}
          className={{ content: 'ml-14' }}
          parentId={comment.id}
          comment={node}
          isChildComment
          onEdit={(edge) => props.onEdit(edge, comment)}
        />
      ))}
      {shouldShowBanner && (
        <EnableNotification
          className={!comment.children?.edges?.length && 'mt-3'}
          source={NotificationPromptSource.NewComment}
        />
      )}
    </section>
  );
}
