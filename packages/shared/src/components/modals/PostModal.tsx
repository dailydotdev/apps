import React, { ReactElement } from 'react';
import { ModalProps } from './common/Modal';
import { PostContent } from '../post/PostContent';
import { PostNavigationProps } from '../post/PostNavigation';
import { Origin } from '../../lib/analytics';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import usePostById from '../../hooks/usePostById';
import BasePostModal from './BasePostModal';

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
  const { post, isLoading } = usePostById({ id, isFetchingNextPage });
  const position = usePostNavigationPosition({
    isLoading,
    isDisplayed: props.isOpen,
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
          navigation: { actions: 'tablet:hidden ml-auto' },
        }}
        onClose={onRequestClose}
        isLoading={isLoading}
        analyticsOrigin={Origin.ArticleModal}
      />
    </BasePostModal>
  );
}
