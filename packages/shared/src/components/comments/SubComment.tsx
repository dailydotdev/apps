import React, { ReactElement } from 'react';
import { Comment } from '../../graphql/comments';
import CommentBox, { CommentBoxProps } from './CommentBox';
import { CommentMarkdownInput } from '../fields/MarkdownInput/CommentMarkdownInput';
import { useComments } from '../../hooks/post';

export interface SubCommentProps
  extends Omit<CommentBoxProps, 'onEdit' | 'onComment'> {
  parentComment: Comment;
}

function SubComment({
  comment,
  parentComment,
  className,
  ...props
}: SubCommentProps): ReactElement {
  const { replyComment, onReplyTo, inputProps } = useComments();

  return (
    <>
      {!inputProps?.editCommentId && (
        <CommentBox
          {...props}
          key={comment.id}
          parentId={parentComment.id}
          comment={comment}
          onEdit={(selected) => onReplyTo([selected, parentComment.id, true])}
          className={{ container: 'relative', content: 'ml-14' }}
          onComment={(selected, parent) => onReplyTo([comment, parent])}
        >
          <div
            className="absolute top-0 bottom-0 left-9 -ml-px w-0.5 bg-theme-float"
            data-testid="subcomment"
          />
        </CommentBox>
      )}
      {replyComment?.id === comment.id && (
        <CommentMarkdownInput
          {...inputProps}
          className={className}
          postId={props.post.id}
          onCommented={() => onReplyTo(null)}
        />
      )}
    </>
  );
}

export default SubComment;
