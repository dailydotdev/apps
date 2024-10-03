import React, { ReactElement, useContext } from 'react';
import { Modal, ModalProps, modalSizeToClassName } from './common/Modal';
import { ONBOARDING_OFFSET } from '../post/PostContent';
import { Origin } from '../../lib/log';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import BasePostModal from './BasePostModal';
import OnboardingContext from '../../contexts/OnboardingContext';
import { Post, PostType } from '../../graphql/posts';
import { PassedPostNavigationProps } from '../post/common';
import { CollectionPostContent } from '../post/collection';

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
  const { position, onLoad } = usePostNavigationPosition({
    isDisplayed: props.isOpen,
    offset: showArticleOnboarding ? ONBOARDING_OFFSET : 0,
  });

  return (
    <BasePostModal
      {...props}
      onAfterOpen={onLoad}
      onRequestClose={onRequestClose}
      postType={PostType.Collection}
      source={post.source}
      loadingClassName="!pb-2 laptop:pb-0"
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
          navigation: { actions: 'ml-auto laptop:hidden' },
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
