import React, {
  CSSProperties,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from 'react';
import classNames from 'classnames';
import { useQuery } from 'react-query';
import request from 'graphql-request';
import { Modal } from './common/Modal';
import { ModalProps } from './StyledModal';
import { useHideOnModal } from '../../hooks/useHideOnModal';
import { useResetScrollForResponsiveModal } from '../../hooks/useResetScrollForResponsiveModal';
import { PostContent, SCROLL_OFFSET } from '../post/PostContent';
import styles from './PostModal.module.css';
import { PostData, POST_BY_ID_QUERY } from '../../graphql/posts';
import { apiUrl } from '../../lib/config';
import AuthContext from '../../contexts/AuthContext';
import { PostNavigationProps } from '../post/common';

interface PostModalProps
  extends ModalProps,
    Pick<PostNavigationProps, 'onPreviousPost' | 'onNextPost'> {
  id: string;
  isFetchingNextPage?: boolean;
}

export default function PostModal({
  className,
  children,
  onRequestClose,
  id,
  isFetchingNextPage,
  onPreviousPost,
  onNextPost,
  ...props
}: PostModalProps): ReactElement {
  const [position, setPosition] =
    useState<CSSProperties['position']>('relative');
  const { tokenRefreshed } = useContext(AuthContext);
  useResetScrollForResponsiveModal();
  useHideOnModal(props.isOpen);

  const {
    data: postById,
    isLoading,
    isFetched,
  } = useQuery<PostData>(
    ['post', id],
    () => request(`${apiUrl}/graphql`, POST_BY_ID_QUERY, { id }),
    { enabled: !!id && tokenRefreshed },
  );

  useEffect(() => {
    const modal = document.getElementById('post-modal');

    if (!modal) {
      return;
    }

    const parent = modal.parentElement;

    const onScroll = (e) => {
      if (e.currentTarget.scrollTop > SCROLL_OFFSET) {
        if (position !== 'fixed') {
          setPosition('fixed');
        }
        return;
      }

      if (position !== 'relative') {
        setPosition('relative');
      }
    };

    parent.addEventListener('scroll', onScroll);

    // eslint-disable-next-line consistent-return
    return () => {
      parent.removeEventListener('scroll', onScroll);
    };
  }, [position]);

  useEffect(() => {
    if (isLoading) {
      const modal = document.getElementById('post-modal');

      if (!modal) {
        return;
      }

      const parent = modal.parentElement;

      parent?.scrollTo?.(0, 0);
      setPosition('relative');
    }
  }, [isLoading]);

  return (
    <Modal
      size={Modal.Size.Large}
      kind={Modal.Kind.FlexibleTop}
      {...props}
      portalClassName={styles.postModal}
      className={classNames(className, 'post-modal focus:outline-none')}
      overlayClassName="post-modal-overlay bg-overlay-quaternary-onion"
      onRequestClose={onRequestClose}
      id="post-modal"
    >
      <PostContent
        position={position}
        postById={postById}
        onPreviousPost={onPreviousPost}
        onNextPost={onNextPost}
        className="post-content"
        onClose={onRequestClose}
        isLoading={isLoading || !isFetched || isFetchingNextPage}
        isModal
      />
    </Modal>
  );
}
