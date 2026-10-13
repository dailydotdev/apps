import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ModalProps } from './common/Modal';
import { Modal, modalSizeToClassName } from './common/Modal';
import { Origin } from '../../lib/log';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import BasePostModal, {
  postModalFixedNavigationClassName,
} from './BasePostModal';
import type { Post } from '../../graphql/posts';
import type { PassedPostNavigationProps } from '../post/common';
import { CollectionPostContent } from '../post/collection';

interface CollectionPostModalProps
  extends ModalProps,
    PassedPostNavigationProps {
  id: string;
  post: Post;
}

export default function CollectionPostModal({
  id,
  className,
  onRequestClose,
  onPreviousPost,
  onNextPost,
  postPosition,
  post,
  ...props
}: CollectionPostModalProps): ReactElement {
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
      navigationContentOwnsActions
      onRequestClose={onRequestClose}
      source={post.source}
      loadingClassName="!pb-2 laptop:pb-0"
      postPosition={postPosition}
      onPreviousPost={onPreviousPost}
      onNextPost={onNextPost}
    >
      <CollectionPostContent
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
            container: classNames(
              modalSizeToClassName[Modal.Size.XLarge],
              postModalFixedNavigationClassName,
            ),
            actions: 'ml-auto',
          },
        }}
        onClose={onRequestClose}
        origin={Origin.CollectionModal}
      />
    </BasePostModal>
  );
}
