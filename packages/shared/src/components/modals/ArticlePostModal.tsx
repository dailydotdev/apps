import React, { ReactElement } from 'react';
import { Modal, ModalProps, modalSizeToClassName } from './common/Modal';
import { PostContent } from '../post/PostContent';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import BasePostModal from './BasePostModal';
import { Post, PostType } from '../../graphql/posts';
import { PassedPostNavigationProps } from '../post/common';
import { Origin } from '../../lib/log';

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
  const { position, onLoad } = usePostNavigationPosition({
    isDisplayed: props.isOpen,
    offset: 0,
  });

  return (
    <BasePostModal
      {...props}
      onAfterOpen={onLoad}
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
