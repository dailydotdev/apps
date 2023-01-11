import React, { ReactElement } from 'react';
import { Comment } from '../../graphql/comments';
import CommentBox, { CommentBoxProps } from './CommentBox';

interface SubCommentProps extends CommentBoxProps {
  parentComment: Comment;
}

function SubComment({
  comment,
  parentComment,
  ...props
}: SubCommentProps): ReactElement {
  return (
    <CommentBox
      {...props}
      key={comment.id}
      parentId={comment.id}
      comment={comment}
      onEdit={(edge) => props.onEdit(edge, comment)}
      className={{ container: 'relative', content: 'ml-14' }}
    >
      <div className="absolute top-0 bottom-0 left-8 w-0.5 bg-theme-float" />
    </CommentBox>
  );
}

export default SubComment;
