import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import type { Origin } from '../../lib/log';
import { LogEvent } from '../../lib/log';
import type { CommentActionProps } from './CommentActionButtons';
import CommentActionButtons from './CommentActionButtons';
import type { CommentContainerProps } from './CommentContainer';
import CommentContainer from './CommentContainer';
import { postLogEvent } from '../../lib/feed';
import { useLogContext } from '../../contexts/LogContext';

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
  const { logEvent } = useLogContext();
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
  });
  useEffect(() => {
    if (inView) {
      logEvent(
        postLogEvent(LogEvent.ImpressionComment, post, {
          extra: { commentId: comment.id },
        }),
      );
    }
  }, [inView, comment, logEvent, post]);

  return (
    <>
      <span ref={inViewRef} />
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
    </>
  );
}

export default CommentBox;
