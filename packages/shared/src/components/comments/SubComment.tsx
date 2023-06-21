import React, { ReactElement } from 'react';
import { Comment } from '../../graphql/comments';
import CommentBox, { CommentBoxProps } from './CommentBox';
import { CommentMarkdownInput } from '../fields/MarkdownInput/CommentMarkdownInput';
import { useComments } from '../../hooks/post';

export interface SubCommentProps
  extends Omit<CommentBoxProps, 'onEdit' | 'onComment'> {
  parentComment: Comment;
  onCommented: (comment: Comment, isNew?: boolean) => void;
}

function SubComment({
  comment,
  parentComment,
  className,
  onCommented,
  ...props
}: SubCommentProps): ReactElement {
  const { replyComment, onReplyTo, inputProps } = useComments(props.post);
  const {
    replyComment: editComment,
    inputProps: editProps,
    onReplyTo: onEdit,
  } = useComments(props.post);

  return (
    <>
      {!editComment && (
        <CommentBox
          {...props}
          key={comment.id}
          parentId={parentComment.id}
          comment={comment}
          onEdit={(selected) => onEdit([selected, parentComment.id, true])}
          className={{ container: 'relative', content: 'ml-14' }}
          onComment={(selected, parent) => onReplyTo([comment, parent])}
        >
          <div
            className="absolute top-0 bottom-0 left-9 -ml-px w-0.5 bg-theme-float"
            data-testid="subcomment"
          />
        </CommentBox>
      )}
      {editComment && (
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
      {replyComment?.id === comment.id && (
        <CommentMarkdownInput
          {...inputProps}
          className={className}
          post={props.post}
          onCommented={(data, isNew) => {
            onReplyTo(null);
            onCommented(data, isNew);
          }}
        />
      )}
    </>
  );
}

export default SubComment;
