import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from './common/Modal';
import { Modal, modalSizeToClassName } from './common/Modal';
import { Origin } from '../../lib/log';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import BasePostModal from './BasePostModal';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import type { PassedPostNavigationProps } from '../post/common';
import { BriefPostContent } from '../post/brief/BriefPostContent';

interface BriefPostModalProps extends ModalProps, PassedPostNavigationProps {
  id: string;
  post: Post;
}

export default function BriefPostModal({
  id,
  className,
  onRequestClose,
  onPreviousPost,
  onNextPost,
  postPosition,
  post,
  onRemovePost,
  ...props
}: BriefPostModalProps): ReactElement {
  const { position, onLoad } = usePostNavigationPosition({
    isDisplayed: props.isOpen,
    offset: 0,
  });

  return (
    <BasePostModal
      {...props}
      onAfterOpen={onLoad}
      onRequestClose={onRequestClose}
      postType={PostType.Brief}
      source={post.source}
      loadingClassName="!pb-2 laptop:pb-0"
      size={Modal.Size.Large}
    >
      <BriefPostContent
        position={position}
        post={post}
        postPosition={postPosition}
        onPreviousPost={onPreviousPost}
        onNextPost={onNextPost}
        inlineActions
        className={{
          onboarding: 'mt-8',
          navigation: { actions: 'ml-auto laptop:hidden' },
          fixedNavigation: {
            container: modalSizeToClassName[Modal.Size.XLarge],
            actions: 'ml-auto',
          },
        }}
        onClose={onRequestClose}
        origin={Origin.BriefModal}
        onRemovePost={onRemovePost}
      />
    </BasePostModal>
  );
}
