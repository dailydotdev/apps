import React, { ReactElement, useContext } from 'react';
import { Modal, ModalProps, modalSizeToClassName } from './common/Modal';
import { ONBOARDING_OFFSET, PostContent } from '../post/PostContent';
import { Origin } from '../../lib/analytics';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import BasePostModal from './BasePostModal';
import OnboardingContext from '../../contexts/OnboardingContext';
import { Post, PostType } from '../../graphql/posts';
import { PassedPostNavigationProps } from '../post/common';
import usePostById from '../../hooks/usePostById';

interface ArticlePostModalProps extends ModalProps, PassedPostNavigationProps {
  id: string;
  post: Post;
}

export default function ArticlePostModal({
  id,
  className,
  onRequestClose,
  onPreviousPost,
  onNextPost,
  postPosition,
  post,
  onRemovePost,
  ...props
}: ArticlePostModalProps): ReactElement {
  const { showArticleOnboarding } = useContext(OnboardingContext);
  const { isPostLoadingOrFetching } = usePostById({ id });
  const position = usePostNavigationPosition({
    isLoading: isPostLoadingOrFetching,
    isDisplayed: props.isOpen,
    offset: showArticleOnboarding ? ONBOARDING_OFFSET : 0,
  });

  return (
    <BasePostModal
      {...props}
      onRequestClose={onRequestClose}
      postType={PostType.Article}
      source={post.source}
      loadingClassName="!pb-2 tablet:pb-0"
    >
      <PostContent
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
        origin={Origin.ArticleModal}
        onRemovePost={onRemovePost}
      />
    </BasePostModal>
  );
}
