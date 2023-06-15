import React, { ReactElement, useContext, useState } from 'react';
import EnableNotification from '../notifications/EnableNotification';
import CommentBox, { CommentBoxProps } from './CommentBox';
import SubComment from './SubComment';
import AuthContext from '../../contexts/AuthContext';
import { NotificationPromptSource } from '../../lib/analytics';
import { CommentMarkdownInput } from '../fields/MarkdownInput/CommentMarkdownInput';
import { Comment } from '../../graphql/comments';

export interface MainCommentProps extends CommentBoxProps {
  permissionNotificationCommentId?: string;
}

const initialState: [Comment, string, boolean?] = [null, null, false];

export default function MainComment({
  className,
  comment,
  appendTooltipTo,
  permissionNotificationCommentId,
  ...props
}: MainCommentProps): ReactElement {
  const [replyTo, setReplyTo] = useState(initialState);
  const { user } = useContext(AuthContext);
  const shouldShowBanner =
    permissionNotificationCommentId === comment.id ||
    comment.children?.edges?.some(
      ({ node }) => node.id === permissionNotificationCommentId,
    );

  const onComment: typeof props.onComment = (selected, parentId) => {
    setReplyTo([selected, parentId]);
  };

  const [replyComment, parentId, isEdit] = replyTo;

  return (
    <section
      className="flex flex-col items-stretch rounded-24 border border-theme-divider-tertiary scroll-mt-16"
      data-testid="comment"
    >
      {!isEdit && (
        <CommentBox
          {...props}
          comment={comment}
          parentId={comment.id}
          className={{ container: 'border-b' }}
          appendTooltipTo={appendTooltipTo}
          onComment={onComment}
          onEdit={(selected, parentComment) =>
            setReplyTo([selected, parentComment?.id, true])
          }
        />
      )}
      {replyComment?.id === comment.id && (
        <CommentMarkdownInput
          replyTo={isEdit ? null : replyComment.author.username}
          parentCommentId={parentId}
          postId={props.post.id}
          initialContent={
            isEdit ? comment.content : `@${replyComment.author.username} `
          }
          editCommentId={isEdit ? comment.id : null}
          onCommented={() => setReplyTo(initialState)}
        />
      )}
      {comment.children?.edges.map(({ node }) => (
        <SubComment
          {...props}
          key={node.id}
          comment={node}
          parentComment={comment}
          appendTooltipTo={appendTooltipTo}
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
