import React, { ReactElement, useContext } from 'react';
import { Modal, ModalProps, modalSizeToClassName } from './common/Modal';
import { ONBOARDING_OFFSET } from '../post/PostContent';
import { Origin } from '../../lib/analytics';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import BasePostModal from './BasePostModal';
import OnboardingContext from '../../contexts/OnboardingContext';
import { Post, PostType } from '../../graphql/posts';
import { PassedPostNavigationProps } from '../post/common';
import { CollectionPostContent } from '../post/collection';
import usePostById from '../../hooks/usePostById';

interface CollectionPostModalProps
  extends ModalProps,
    PassedPostNavigationProps {
  id: string;
  post: Post;
}

export default function CollectionPostModal({
  id,
  className,
  onRequestClose,
  onPreviousPost,
  onNextPost,
  postPosition,
  post,
  onRemovePost,
  ...props
}: CollectionPostModalProps): ReactElement {
  const { showArticleOnboarding } = useContext(OnboardingContext);
  const { isLoading } = usePostById({ id });
  const position = usePostNavigationPosition({
    isLoading,
    isDisplayed: props.isOpen,
    offset: showArticleOnboarding ? ONBOARDING_OFFSET : 0,
  });

  return (
    <BasePostModal
      {...props}
      onRequestClose={onRequestClose}
      postType={PostType.Collection}
      source={post.source}
      loadingClassName="!pb-2 tablet:pb-0"
    >
      <CollectionPostContent
        position={position}
        post={post}
        postPosition={postPosition}
        onPreviousPost={onPreviousPost}
        onNextPost={onNextPost}
        inlineActions
        className={{
          onboarding: 'mt-8',
          navigation: { actions: 'ml-auto tablet:hidden' },
          fixedNavigation: {
            container: modalSizeToClassName[Modal.Size.XLarge],
            actions: 'ml-auto',
          },
        }}
        onClose={onRequestClose}
        origin={Origin.CollectionModal}
        onRemovePost={onRemovePost}
      />
    </BasePostModal>
  );
}
