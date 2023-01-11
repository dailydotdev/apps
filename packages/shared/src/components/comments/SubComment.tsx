import React, { ReactElement } from 'react';
import { Comment } from '../../graphql/comments';
import CommentBox, { CommentBoxProps } from './CommentBox';

export interface SubCommentProps extends CommentBoxProps {
  parentComment: Comment;
}

function SubComment({
  comment,
  parentComment,
  onEdit,
  ...props
}: SubCommentProps): ReactElement {
  return (
    <CommentBox
      {...props}
      key={comment.id}
      parentId={parentComment.id}
      comment={comment}
      onEdit={(edge) => onEdit(edge, parentComment)}
      className={{ container: 'relative', content: 'ml-14' }}
    >
      <div
        className="absolute top-0 bottom-0 left-8 w-0.5 bg-theme-float"
        data-testid="subcomment"
      />
    </CommentBox>
  );
}

export default SubComment;
