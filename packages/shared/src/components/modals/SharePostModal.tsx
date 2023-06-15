import React, { ReactElement, useContext } from 'react';
import { Modal, ModalProps } from './common/Modal';
import BasePostModal from './BasePostModal';
import { NotificationPromptSource, Origin } from '../../lib/analytics';
import usePostById from '../../hooks/usePostById';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import SquadPostContent from '../post/SquadPostContent';
import OnboardingContext from '../../contexts/OnboardingContext';
import { ONBOARDING_OFFSET } from '../post/BasePostContent';
import { PassedPostNavigationProps } from '../post/PostContent';
import { PostType } from '../../graphql/posts';
import EnableNotification from '../notifications/EnableNotification';

interface PostModalProps extends ModalProps, PassedPostNavigationProps {
  id: string;
}

export default function PostModal({
  id,
  className,
  onRequestClose,
  onPreviousPost,
  onNextPost,
  postPosition,
  onRemovePost,
  ...props
}: PostModalProps): ReactElement {
  const { showArticleOnboarding } = useContext(OnboardingContext);
  const { post, isPostLoadingOrFetching } = usePostById({ id });
  const position = usePostNavigationPosition({
    isLoading: isPostLoadingOrFetching,
    isDisplayed: props.isOpen,
    offset: showArticleOnboarding ? ONBOARDING_OFFSET : 0,
  });
  const containerClass = 'post-content';

  return (
    <BasePostModal
      {...props}
      size={Modal.Size.Large}
      onRequestClose={onRequestClose}
      postType={PostType.Share}
      isLoading={isPostLoadingOrFetching}
      loadingClassName={containerClass}
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
          container: containerClass,
          fixedNavigation: { container: 'w-[inherit]', actions: 'ml-auto' },
          navigation: { actions: 'tablet:hidden ml-auto' },
        }}
      />
    </BasePostModal>
  );
}
