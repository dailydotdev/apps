import type { ReactElement } from 'react';
import React from 'react';
import type { CommentMarkdownInputProps } from '../fields/MarkdownInput/CommentMarkdownInput';
import { CommentMarkdownInput } from '../fields/MarkdownInput/CommentMarkdownInput';
import { ViewSize, useViewSize } from '../../hooks';
import type { LazyModalCommonProps } from '../modals/common/Modal';
import CommentModal from '../modals/post/CommentModal';
import { WriteCommentContext } from '../../contexts/WriteCommentContext';
import { useMutateComment } from '../../hooks/post/useMutateComment';

interface CommentInputOrModalProps
  extends Partial<LazyModalCommonProps>,
    Omit<CommentMarkdownInputProps, 'className'> {
  onClose?: () => void;
  className?: {
    input?: CommentMarkdownInputProps['className'];
    modal?: string;
  };
  replyToCommentId?: string;
}

export default function CommentInputOrModal({
  onClose,
  className,
  ...props
}: CommentInputOrModalProps): ReactElement {
  const isModal = !useViewSize(ViewSize.Tablet);

  const mutateCommentResult = useMutateComment({
    post: props.post,
    editCommentId: props.editCommentId,
    parentCommentId: props.parentCommentId,
    onCommented: props.onCommented,
  });

  if (isModal) {
    return <CommentModal {...props} isOpen onRequestClose={onClose} />;
  }

  return (
    <WriteCommentContext.Provider
      value={{ mutateComment: mutateCommentResult }}
    >
      <CommentMarkdownInput
        {...props}
        className={className.input}
        onClose={onClose}
      />
    </WriteCommentContext.Provider>
  );
}
