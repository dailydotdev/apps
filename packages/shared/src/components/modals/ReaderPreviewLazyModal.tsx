import type { ReactElement } from 'react';
import React from 'react';
import type { LazyModalCommonProps } from './common/Modal';
import type { Post } from '../../graphql/posts';
import { PostPosition } from '../../hooks/usePostModalNavigation';
import ReaderPostModal from './ReaderPostModal';

interface ReaderPreviewLazyModalProps extends LazyModalCommonProps {
  post: Post;
}

function ReaderPreviewLazyModal({
  post,
  isOpen,
  onRequestClose,
}: ReaderPreviewLazyModalProps): ReactElement {
  return (
    <ReaderPostModal
      id={post.id}
      post={post}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      postPosition={PostPosition.Only}
      onPreviousPost={() => undefined}
      onNextPost={() => undefined}
    />
  );
}

export default ReaderPreviewLazyModal;
