import React, { ReactElement, useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { StyledModal, ModalProps } from './StyledModal';
import { useHideOnModal } from '../../hooks/useHideOnModal';
import { useResetScrollForResponsiveModal } from '../../hooks/useResetScrollForResponsiveModal';
import { PostContent, PostContentProps } from '../post/PostContent';
import styles from './PostModal.module.css';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { PostNavigationProps } from '../post/PostNavigation';

interface PostModalProps
  extends ModalProps,
    Pick<PostContentProps, 'isFetchingNextPage'>,
    Pick<PostNavigationProps, 'onPreviousPost' | 'onNextPost'> {
  id: string;
}

export function PostModal({
  className,
  children,
  onRequestClose,
  id,
  isFetchingNextPage,
  onPreviousPost,
  onNextPost,
  ...props
}: PostModalProps): ReactElement {
  const [currentPage, setCurrentPage] = useState<string>();
  const { trackEvent } = useContext(AnalyticsContext);
  const isExtension = !!process.env.TARGET_BROWSER;
  useResetScrollForResponsiveModal();
  useHideOnModal(props.isOpen);

  useEffect(() => {
    if (isExtension) {
      return;
    }

    if (!currentPage) {
      setCurrentPage(window.location.pathname);
    }

    window.history.replaceState({}, `Post: ${id}`, `/posts/${id}`);
  }, [id]);

  const onClose: typeof onRequestClose = (e) => {
    if (!isExtension && currentPage) {
      window.history.replaceState({}, `Feed`, currentPage);
      setCurrentPage(undefined);
    }
    onRequestClose(e);
  };

  useEffect(() => {
    trackEvent({
      event_name: 'article modal view',
      target_id: id,
    });
  }, []);

  return (
    <StyledModal
      {...props}
      className={classNames(className, styles.postModal)}
      style={{ content: { overflow: 'hidden' } }}
      onRequestClose={onClose}
    >
      <PostContent
        id={id}
        onPreviousPost={onPreviousPost}
        onNextPost={onNextPost}
        className="h-full modal-post"
        onClose={onClose}
        isFetchingNextPage={isFetchingNextPage}
        isModal
      />
    </StyledModal>
  );
}
