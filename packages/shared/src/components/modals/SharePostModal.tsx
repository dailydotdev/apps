import React, { ReactElement, useContext } from 'react';
import { Modal, ModalProps } from './common/Modal';
import BasePostModal from './BasePostModal';
import { Origin } from '../../lib/analytics';
import usePostById from '../../hooks/usePostById';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import SquadPostContent from '../post/SquadPostContent';
import OnboardingContext from '../../contexts/OnboardingContext';
import { ONBOARDING_OFFSET } from '../post/BasePostContent';
import { PassedPostNavigationProps } from '../post/PostContent';

interface PostModalProps extends ModalProps, PassedPostNavigationProps {
  id: string;
  isFetchingNextPage?: boolean;
}

export default function PostModal({
  id,
  className,
  isFetchingNextPage,
  onRequestClose,
  onPreviousPost,
  onNextPost,
  postPosition,
  onRemovePost,
  ...props
}: PostModalProps): ReactElement {
  const { showArticleOnboarding } = useContext(OnboardingContext);
  const { post, isLoading } = usePostById({ id, isFetchingNextPage });
  const position = usePostNavigationPosition({
    isLoading,
    isDisplayed: props.isOpen,
    offset: showArticleOnboarding ? ONBOARDING_OFFSET : 0,
  });

  return (
    <BasePostModal
      {...props}
      size={Modal.Size.Large}
      onRequestClose={onRequestClose}
    >
      <SquadPostContent
        position={position}
        post={post}
        onPreviousPost={onPreviousPost}
        onNextPost={onNextPost}
        postPosition={postPosition}
        inlineActions
        onClose={onRequestClose}
        isLoading={isLoading}
        origin={Origin.ArticleModal}
        onRemovePost={onRemovePost}
        className={{
          container: 'post-content',
          fixedNavigation: { container: 'w-[inherit]', actions: 'ml-auto' },
          navigation: { actions: 'tablet:hidden ml-auto' },
        }}
      />
    </BasePostModal>
  );
}
