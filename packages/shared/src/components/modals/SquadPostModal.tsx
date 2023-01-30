import React, { ReactElement, useContext } from 'react';
import { Modal, ModalProps } from './common/Modal';
import { PostNavigationProps } from '../post/PostNavigation';
import BasePostModal from './BasePostModal';
import { Origin } from '../../lib/analytics';
import usePostById from '../../hooks/usePostById';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import SquadPostContent from '../post/SquadPostContent';
import OnboardingContext from '../../contexts/OnboardingContext';
import { ONBOARDING_OFFSET } from '../post/BasePostContent';

interface PostModalProps
  extends ModalProps,
    Pick<PostNavigationProps, 'onPreviousPost' | 'onNextPost'> {
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
        inlineActions
        onClose={onRequestClose}
        isLoading={isLoading}
        origin={Origin.ArticleModal}
        className={{
          container: 'post-content',
          fixedNavigation: { container: 'w-[inherit]' },
          navigation: { actions: 'tablet:hidden ml-auto' },
        }}
      />
    </BasePostModal>
  );
}
