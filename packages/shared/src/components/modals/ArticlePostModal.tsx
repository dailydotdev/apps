import React, { ReactElement, useContext } from 'react';
import { Modal, ModalProps, modalSizeToClassName } from './common/Modal';
import {
  ONBOARDING_OFFSET,
  PassedPostNavigationProps,
  PostContent,
} from '../post/PostContent';
import { Origin } from '../../lib/analytics';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import BasePostModal from './BasePostModal';
import OnboardingContext from '../../contexts/OnboardingContext';
import { Post, PostType } from '../../graphql/posts';
import CollectionPostContent from '../post/collection/CollectionPostContent';

interface ArticlePostModalProps extends ModalProps, PassedPostNavigationProps {
  id: string;
  post: Post;
}

type SimilarPostTypes = Exclude<
  PostType,
  PostType.Share | PostType.Welcome | PostType.Freeform
>;

const CONTENT_MAP: Record<SimilarPostTypes, typeof PostContent> = {
  collection: CollectionPostContent,
  article: PostContent,
};

const ORIGIN_MAP: Record<SimilarPostTypes, string> = {
  collection: Origin.CollectionModal,
  article: Origin.CollectionModal,
};

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
  const position = usePostNavigationPosition({
    isLoading: false,
    isDisplayed: props.isOpen,
    offset: showArticleOnboarding ? ONBOARDING_OFFSET : 0,
  });
  const Content = CONTENT_MAP[post?.type];
  const postOrigin = ORIGIN_MAP[post?.type];

  return (
    <BasePostModal
      {...props}
      onRequestClose={onRequestClose}
      postType={post.type}
      source={post.source}
      loadingClassName="!pb-2 tablet:pb-0"
    >
      <Content
        position={position}
        post={post}
        postPosition={postPosition}
        onPreviousPost={onPreviousPost}
        onNextPost={onNextPost}
        inlineActions
        className={{
          onboarding: 'mt-8',
          navigation: { actions: 'tablet:hidden ml-auto' },
          fixedNavigation: {
            container: modalSizeToClassName[Modal.Size.XLarge],
            actions: 'ml-auto',
          },
        }}
        onClose={onRequestClose}
        origin={postOrigin}
        onRemovePost={onRemovePost}
      />
    </BasePostModal>
  );
}
