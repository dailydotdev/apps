import React, { ReactElement, useContext } from 'react';
import { Modal, ModalProps, modalSizeToClassName } from './common/Modal';
import {
  ONBOARDING_OFFSET,
  PassedPostNavigationProps,
  PostContent,
} from '../post/PostContent';
import { Origin } from '../../lib/analytics';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import usePostById from '../../hooks/usePostById';
import BasePostModal from './BasePostModal';
import OnboardingContext from '../../contexts/OnboardingContext';

interface ArticlePostModalProps extends ModalProps, PassedPostNavigationProps {
  id: string;
  isFetchingNextPage?: boolean;
}

export default function ArticlePostModal({
  id,
  className,
  isFetchingNextPage,
  onRequestClose,
  onPreviousPost,
  onNextPost,
  postPosition,
  onRemovePost,
  ...props
}: ArticlePostModalProps): ReactElement {
  const { showArticleOnboarding } = useContext(OnboardingContext);
  const { post, isLoading } = usePostById({ id, isFetchingNextPage });
  const position = usePostNavigationPosition({
    isLoading,
    isDisplayed: props.isOpen,
    offset: showArticleOnboarding ? ONBOARDING_OFFSET : 0,
  });

  return (
    <BasePostModal {...props} onRequestClose={onRequestClose}>
      <PostContent
        position={position}
        post={post}
        postPosition={postPosition}
        onPreviousPost={onPreviousPost}
        onNextPost={onNextPost}
        inlineActions
        className={{
          onboarding: 'mt-8',
          container: 'border border-theme-divider-tertiary rounded-16',
          navigation: { actions: 'tablet:hidden ml-auto' },
          fixedNavigation: {
            container: modalSizeToClassName[Modal.Size.XLarge],
            actions: 'ml-auto',
          },
        }}
        onClose={onRequestClose}
        isLoading={isLoading}
        origin={Origin.ArticleModal}
        onRemovePost={onRemovePost}
      />
    </BasePostModal>
  );
}
