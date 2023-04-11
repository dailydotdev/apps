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
import PostLoadingSkeleton from '../post/PostLoadingSkeleton';
import { PostType } from '../../graphql/posts';

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
  const {
    post,
    query: { isLoading, isFetching },
  } = usePostById({ id });
  const isPostLoading = isLoading || isFetchingNextPage || isFetching;
  const position = usePostNavigationPosition({
    isLoading: isPostLoading,
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
      isLoading={isPostLoading}
      loadingClassName={containerClass}
    >
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
