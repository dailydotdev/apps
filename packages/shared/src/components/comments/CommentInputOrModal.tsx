import React, { ReactElement } from 'react';
import {
  CommentMarkdownInput,
  CommentMarkdownInputProps,
} from '../fields/MarkdownInput/CommentMarkdownInput';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { ViewSize, useViewSize } from '../../hooks';
import { LazyModalCommonProps } from '../modals/common/Modal';

interface CommentInputOrModalProps
  extends Partial<LazyModalCommonProps>,
    Omit<CommentMarkdownInputProps, 'className'> {
  onClose?: () => void;
  className?: {
    input?: CommentMarkdownInputProps['className'];
    modal?: string;
  };
}

export default function CommentInputOrModal({
  onClose,
  className,
  ...props
}: CommentInputOrModalProps): ReactElement {
  const { modal, openModal } = useLazyModal();
  const isModal = !useViewSize(ViewSize.Laptop);

  if (isModal) {
    if (!modal) {
      openModal({
        type: LazyModal.Comment,
        props: {
          ...props,
          onAfterClose: onClose,
        },
      });
    }

    return null;
  }

  return <CommentMarkdownInput {...props} className={className.input} />;
}
