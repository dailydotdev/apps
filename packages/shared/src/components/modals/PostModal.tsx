import React, { ReactElement, useContext } from 'react';
import { ModalProps, modalSizeToClassName } from './common/Modal';
import { ONBOARDING_OFFSET, PostContent } from '../post/PostContent';
import { PostNavigationProps } from '../post/PostNavigation';
import { Origin } from '../../lib/analytics';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import usePostById from '../../hooks/usePostById';
import BasePostModal from './BasePostModal';
import { ModalSize } from './common/types';
import AlertContext from '../../contexts/AlertContext';
import useSidebarRendered from '../../hooks/useSidebarRendered';

interface PostModalProps
  extends ModalProps,
    Pick<PostNavigationProps, 'onPreviousPost' | 'onNextPost'> {
  id: string;
  isFetchingNextPage?: boolean;
}

export const postModalOverlayClasses =
  'post-modal-overlay bg-overlay-quaternary-onion';

export default function PostModal({
  id,
  className,
  isFetchingNextPage,
  onRequestClose,
  onPreviousPost,
  onNextPost,
  ...props
}: PostModalProps): ReactElement {
  const { alerts } = useContext(AlertContext);
  const { sidebarRendered } = useSidebarRendered();
  const { post, isLoading } = usePostById({ id, isFetchingNextPage });
  const position = usePostNavigationPosition({
    isLoading,
    isDisplayed: props.isOpen,
    offset: sidebarRendered && alerts?.filter ? ONBOARDING_OFFSET : 0,
  });

  return (
    <BasePostModal {...props} onRequestClose={onRequestClose}>
      <PostContent
        position={position}
        post={post}
        onPreviousPost={onPreviousPost}
        onNextPost={onNextPost}
        inlineActions
        className={{
          container: 'post-content',
          fixedNavigation: {
            container: modalSizeToClassName[ModalSize.XLarge],
          },
          navigation: { actions: 'tablet:hidden ml-auto' },
        }}
        onClose={onRequestClose}
        isLoading={isLoading}
        analyticsOrigin={Origin.ArticleModal}
      />
    </BasePostModal>
  );
}
