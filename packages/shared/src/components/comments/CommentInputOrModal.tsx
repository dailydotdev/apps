import React, { ReactElement } from 'react';

import { WriteCommentContext } from '../../contexts/WriteCommentContext';
import { useViewSize, ViewSize } from '../../hooks';
import { useMutateComment } from '../../hooks/post/useMutateComment';
import {
  CommentMarkdownInput,
  CommentMarkdownInputProps,
} from '../fields/MarkdownInput/CommentMarkdownInput';
import { LazyModalCommonProps } from '../modals/common/Modal';
import CommentModal from '../modals/post/CommentModal';

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
      <CommentMarkdownInput {...props} className={className.input} />
    </WriteCommentContext.Provider>
  );
}
