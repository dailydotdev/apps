import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import BasePostModal from './BasePostModal';
import { NotificationPromptSource, Origin } from '../../lib/log';
import type { PassedPostNavigationProps } from '../post/common';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import { isSourceUserSource } from '../../graphql/sources';
import { useReadArticle } from '../../hooks/usePostContent';
import EnableNotification from '../notifications/EnableNotification';
import { PostHybridContent } from '../post/hybrid/PostHybridContent';

interface PostHybridModalProps extends ModalProps, PassedPostNavigationProps {
  id: string;
  post: Post;
}

const squadPostTypes = [PostType.Share, PostType.Freeform, PostType.Poll];

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

  return (
    <BasePostModal
      {...props}
      post={post}
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
      {squadPostTypes.includes(post.type) && (
        <EnableNotification
          source={NotificationPromptSource.SquadPostModal}
          label={
            isSourceUserSource(post.source)
              ? post.author?.username
              : post.source?.handle
          }
        />
      )}
      <PostHybridContent
        post={post}
        origin={origin}
        isModal
        onClose={onRequestClose}
      />
    </BasePostModal>
  );
}
