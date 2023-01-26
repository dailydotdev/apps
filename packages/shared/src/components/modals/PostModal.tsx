import React, { ReactElement } from 'react';
import { ModalProps } from './common/Modal';
import { PostContent } from '../post/PostContent';
import { PostNavigationProps } from '../post/PostNavigation';
import BasePostModal from './BasePostModal';

interface PostModalProps
  extends ModalProps,
    Pick<PostNavigationProps, 'onPreviousPost' | 'onNextPost'> {
  id: string;
  isFetchingNextPage?: boolean;
}

export default function PostModal({
  className,
  onRequestClose,
  onPreviousPost,
  onNextPost,
  ...props
}: PostModalProps): ReactElement {
  return (
    <BasePostModal {...props} onRequestClose={onRequestClose}>
      {({ postById, position, isLoading }) => (
        <PostContent
          position={position}
          postById={postById}
          onPreviousPost={onPreviousPost}
          onNextPost={onNextPost}
          inlineActions
          className={{
            container: 'post-content',
            navigation: { actions: 'tablet:hidden ml-auto' },
          }}
          onClose={onRequestClose}
          isLoading={isLoading}
          isModal
        />
      )}
    </BasePostModal>
  );
}
