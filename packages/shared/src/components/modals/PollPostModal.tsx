import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import BasePostModal from './BasePostModal';
import { NotificationPromptSource, Origin } from '../../lib/log';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import type { PassedPostNavigationProps } from '../post/common';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import EnableNotification from '../notifications/EnableNotification';
import { PollPostContent } from '../post/poll/PollPostContent';
import { isSourceUserSource } from '../../graphql/sources';

interface PollPostModalProps extends ModalProps, PassedPostNavigationProps {
  id: string;
  post: Post;
}

export default function PollPostModal({
  id,
  className,
  onRequestClose,
  onPreviousPost,
  onNextPost,
  postPosition,
  post,
  ...props
}: PollPostModalProps): ReactElement {
  const { position, onLoad } = usePostNavigationPosition({
    isDisplayed: props.isOpen,
    offset: 0,
  });

  return (
    <BasePostModal
      {...props}
      post={post}
      onAfterOpen={onLoad}
      size={Modal.Size.XLarge}
      onRequestClose={onRequestClose}
      postType={PostType.Poll}
      source={post.source}
      loadingClassName="!pb-2 tablet:pb-0"
      postPosition={postPosition}
      onPreviousPost={onPreviousPost}
      onNextPost={onNextPost}
    >
      <EnableNotification
        source={NotificationPromptSource.SquadPostModal}
        label={
          isSourceUserSource(post?.source)
            ? post?.author?.username
            : post?.source?.handle
        }
      />
      <PollPostContent
        position={position}
        post={post}
        onPreviousPost={onPreviousPost}
        onNextPost={onNextPost}
        postPosition={postPosition}
        inlineActions
        onClose={onRequestClose}
        origin={Origin.ArticleModal}
        className={{
          fixedNavigation: { container: '!w-[inherit]', actions: 'ml-auto' },
          navigation: { actions: 'tablet:hidden ml-auto' },
          onboarding: 'mb-0 mt-8',
        }}
      />
    </BasePostModal>
  );
}
