import React, { ReactElement } from 'react';
import {
  CommentMarkdownInput,
  CommentMarkdownInputProps,
} from '../fields/MarkdownInput/CommentMarkdownInput';
import { ViewSize, useViewSize } from '../../hooks';
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
  const isModal = !useViewSize(ViewSize.Laptop);

  if (isModal) {
    return <CommentModal {...props} isOpen onRequestClose={onClose} />;
  }

  return <CommentMarkdownInput {...props} className={className.input} />;
}
