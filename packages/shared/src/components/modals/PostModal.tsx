import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { StyledModal, ModalProps } from './StyledModal';
import { useHideOnModal } from '../../hooks/useHideOnModal';
import { useResetScrollForResponsiveModal } from '../../hooks/useResetScrollForResponsiveModal';
import { PostContent, PostContentProps } from '../post/PostContent';
import styles from './PostModal.module.css';

interface PostModalProps
  extends ModalProps,
    Pick<PostContentProps, 'navigation'> {
  id: string;
}

export function PostModal({
  className,
  children,
  onRequestClose,
  id,
  navigation,
  ...props
}: PostModalProps): ReactElement {
  useResetScrollForResponsiveModal();
  useHideOnModal(props.isOpen);

  return (
    <StyledModal
      {...props}
      className={classNames(className, styles.postModal)}
      onRequestClose={onRequestClose}
    >
      <PostContent
        id={id}
        navigation={navigation}
        className="h-full modal-post"
        onClose={onRequestClose}
      />
    </StyledModal>
  );
}
