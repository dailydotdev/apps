import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from './common/Modal';
import { Modal, modalSizeToClassName } from './common/Modal';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import BasePostModal from './BasePostModal';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import type { PassedPostNavigationProps } from '../post/common';
import { Origin } from '../../lib/log';
import { TweetPostContent } from '../post/tweet/TweetPostContent';

interface TweetPostModalProps extends ModalProps, PassedPostNavigationProps {
  id: string;
  post: Post;
}

export default function TweetPostModal({
  id,
  className,
  onRequestClose,
  onPreviousPost,
  onNextPost,
  postPosition,
  post,
  ...props
}: TweetPostModalProps): ReactElement {
  const { position, onLoad } = usePostNavigationPosition({
    isDisplayed: props.isOpen,
    offset: 0,
  });
  return (
    <BasePostModal
      {...props}
      post={post}
      onAfterOpen={onLoad}
      onRequestClose={onRequestClose}
      postType={PostType.Tweet}
      source={post.source}
      loadingClassName="!pb-2 tablet:pb-0"
      postPosition={postPosition}
      onPreviousPost={onPreviousPost}
      onNextPost={onNextPost}
    >
      <TweetPostContent
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
      />
    </BasePostModal>
  );
}
