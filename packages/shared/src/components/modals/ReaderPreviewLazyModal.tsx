import type { ReactElement } from 'react';
import React from 'react';
import type { LazyModalCommonProps } from './common/Modal';
import type { Post } from '../../graphql/posts';
import { PostPosition } from '../../hooks/usePostModalNavigation';
import ReaderPostModal from './ReaderPostModal';

interface ReaderPreviewLazyModalProps extends LazyModalCommonProps {
  post: Post;
  /**
   * Close handler for the surface that owns the original Read post click
   * (e.g. the classic post modal). Forwarded from the install prompt so
   * closing the reader preview also tears down the underlying surface
   * instead of bouncing the user back to the post modal they were trying
   * to leave.
   */
  onCloseParent?: () => void;
}

function ReaderPreviewLazyModal({
  post,
  isOpen,
  onRequestClose,
  onCloseParent,
}: ReaderPreviewLazyModalProps): ReactElement {
  const onRequestCloseWithParent: typeof onRequestClose = (event) => {
    onRequestClose(event);
    onCloseParent?.();
  };

  return (
    <ReaderPostModal
      id={post.id}
      post={post}
      isOpen={isOpen}
      onRequestClose={onRequestCloseWithParent}
      postPosition={PostPosition.Only}
      onPreviousPost={() => undefined}
      onNextPost={() => undefined}
    />
  );
}

export default ReaderPreviewLazyModal;
