import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import BasePostModal from './BasePostModal';
import { Origin } from '../../lib/log';
import type { PassedPostNavigationProps } from '../post/common';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import { useReadArticle } from '../../hooks/usePostContent';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import { PostHybridContent } from '../post/hybrid/PostHybridContent';

interface PostHybridModalProps extends ModalProps, PassedPostNavigationProps {
  id: string;
  post: Post;
}

/** Every post type the post_page_hybrid experiment covers, in one modal. */
export default function PostHybridModal({
  id,
  onRequestClose,
  onPreviousPost,
  onNextPost,
  postPosition,
  post,
  ...props
}: PostHybridModalProps): ReactElement {
  const origin =
    post.type === PostType.Collection
      ? Origin.CollectionModal
      : Origin.ArticleModal;
  const onReadArticle = useReadArticle({ origin, post });
  const { onLoad } = usePostNavigationPosition({
    isDisplayed: props.isOpen,
    offset: 0,
  });

  return (
    <BasePostModal
      {...props}
      post={post}
      onAfterOpen={onLoad}
      size={Modal.Size.XLarge}
      isHybrid
      onReadArticle={onReadArticle}
      onRequestClose={onRequestClose}
      source={post.source}
      loadingClassName="!pb-2 tablet:pb-0"
      postPosition={postPosition}
      onPreviousPost={onPreviousPost}
      onNextPost={onNextPost}
    >
      <PostHybridContent
        post={post}
        origin={origin}
        isModal
        onClose={onRequestClose}
      />
    </BasePostModal>
  );
}
