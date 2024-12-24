import type { ReactElement } from 'react';
import React from 'react';
import type { Origin } from '../../lib/log';
import type { CommentActionProps } from './CommentActionButtons';
import CommentActionButtons from './CommentActionButtons';
import type { CommentContainerProps } from './CommentContainer';
import CommentContainer from './CommentContainer';

export interface CommentBoxProps
  extends Omit<CommentContainerProps, 'actions'>,
    CommentActionProps {
  origin: Origin;
  parentId?: string;
}

function CommentBox({
  post,
  comment,
  origin,
  parentId,
  onComment,
  onShare,
  onDelete,
  onEdit,
  onShowUpvotes,
  children,
  ...props
}: CommentBoxProps): ReactElement {
  return (
    <CommentContainer
      post={post}
      comment={comment}
      actions={
        <CommentActionButtons
          post={post}
          comment={comment}
          origin={origin}
          parentId={parentId}
          onShare={onShare}
          onComment={onComment}
          onDelete={onDelete}
          onEdit={onEdit}
          onShowUpvotes={onShowUpvotes}
          className="pointer-events-auto mt-3"
        />
      }
      {...props}
    >
      {children}
    </CommentContainer>
  );
}

export default CommentBox;
