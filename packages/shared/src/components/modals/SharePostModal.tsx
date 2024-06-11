import React, { ReactElement, useContext } from 'react';
import { Modal, ModalProps } from './common/Modal';
import BasePostModal from './BasePostModal';
import { NotificationPromptSource, Origin } from '../../lib/log';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import SquadPostContent from '../post/SquadPostContent';
import OnboardingContext from '../../contexts/OnboardingContext';
import { ONBOARDING_OFFSET } from '../post/BasePostContent';
import { PassedPostNavigationProps } from '../post/common';
import { Post, PostType } from '../../graphql/posts';
import EnableNotification from '../notifications/EnableNotification';

interface PostModalProps extends ModalProps, PassedPostNavigationProps {
  id: string;
  post: Post;
}

export default function PostModal({
  id,
  className,
  onRequestClose,
  onPreviousPost,
  onNextPost,
  postPosition,
  post,
  onRemovePost,
  ...props
}: PostModalProps): ReactElement {
  const { showArticleOnboarding } = useContext(OnboardingContext);
  const { position, onLoad } = usePostNavigationPosition({
    isDisplayed: props.isOpen,
    offset: showArticleOnboarding ? ONBOARDING_OFFSET : 0,
  });

  return (
    <BasePostModal
      {...props}
      onAfterOpen={onLoad}
      size={Modal.Size.XLarge}
      onRequestClose={onRequestClose}
      postType={PostType.Share}
      source={post.source}
      loadingClassName="!pb-2 tablet:pb-0"
    >
      <EnableNotification
        source={NotificationPromptSource.SquadPostModal}
        label={post?.source?.handle}
      />
      <SquadPostContent
        position={position}
        post={post}
        onPreviousPost={onPreviousPost}
        onNextPost={onNextPost}
        postPosition={postPosition}
        inlineActions
        onClose={onRequestClose}
        origin={Origin.ArticleModal}
        onRemovePost={onRemovePost}
        className={{
          fixedNavigation: { container: '!w-[inherit]', actions: 'ml-auto' },
          navigation: { actions: 'ml-auto tablet:hidden' },
          onboarding: 'mb-0 mt-8',
        }}
      />
    </BasePostModal>
  );
}
