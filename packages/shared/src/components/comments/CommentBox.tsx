import React, { ReactElement } from 'react';
import { Origin } from '../../lib/log';
import CommentActionButtons, {
  CommentActionProps,
} from './CommentActionButtons';
import CommentContainer, { CommentContainerProps } from './CommentContainer';

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
