import React, { ReactElement, useEffect } from 'react';
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
  const isExtension = !!process.env.TARGET_BROWSER;
  useResetScrollForResponsiveModal();
  useHideOnModal(props.isOpen);

  useEffect(() => {
    if (isExtension) {
      return;
    }

    window.history.replaceState({}, `Post: ${id}`, `/posts/${id}`);
  }, [id]);

  const onClose: typeof onRequestClose = (e) => {
    if (isExtension) {
      window.history.replaceState({}, `Feed`, '/');
    }
    onRequestClose(e);
  };

  return (
    <StyledModal
      {...props}
      className={classNames(className, styles.postModal)}
      style={{ content: { overflow: 'hidden' } }}
      onRequestClose={onClose}
    >
      <PostContent
        id={id}
        navigation={navigation}
        className="h-full modal-post"
        onClose={onClose}
      />
    </StyledModal>
  );
}
