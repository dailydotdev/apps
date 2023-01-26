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
import { Modal, ModalProps } from './common/Modal';
import { useHideOnModal } from '../../hooks/useHideOnModal';
import { useResetScrollForResponsiveModal } from '../../hooks/useResetScrollForResponsiveModal';
import { ONBOARDING_OFFSET, SCROLL_OFFSET } from '../post/PostContent';
import styles from './BasePostModal.module.css';
import { PostData, POST_BY_ID_QUERY } from '../../graphql/posts';
import { apiUrl } from '../../lib/config';
import AuthContext from '../../contexts/AuthContext';
import AlertContext from '../../contexts/AlertContext';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { PostNavigationProps } from '../post/PostNavigation';
import { useScrollTopOffset } from '../../hooks/useScrollTopOffset';

type Navigation = Pick<PostNavigationProps, 'onPreviousPost' | 'onNextPost'>;

interface ChildrenProps extends Navigation {
  postById: PostData;
  isLoading: boolean;
  position: CSSProperties['position'];
}

interface BasePostModalProps extends ModalProps {
  id: string;
  isFetchingNextPage?: boolean;
  children: (props: ChildrenProps) => ReactElement;
}

export default function BasePostModal({
  className,
  children,
  onRequestClose,
  id,
  isFetchingNextPage,
  ...props
}: BasePostModalProps): ReactElement {
  const { alerts } = useContext(AlertContext);
  const { sidebarRendered } = useSidebarRendered();
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
  useScrollTopOffset(
    () => document?.getElementById?.('post-modal')?.parentElement,
    {
      onOverOffset: () => position !== 'fixed' && setPosition('fixed'),
      onUnderOffset: () => position !== 'relative' && setPosition('relative'),
      offset:
        sidebarRendered && alerts?.filter
          ? SCROLL_OFFSET + ONBOARDING_OFFSET
          : SCROLL_OFFSET,
    },
  );

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
      {children({
        postById,
        position,
        isLoading: isLoading || !isFetched || isFetchingNextPage,
      })}
    </Modal>
  );
}
