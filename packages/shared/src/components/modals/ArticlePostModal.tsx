import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from './common/Modal';
import { Modal, modalSizeToClassName } from './common/Modal';
import { PostContent } from '../post/PostContent';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import BasePostModal from './BasePostModal';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import type { PassedPostNavigationProps } from '../post/common';
import { Origin } from '../../lib/log';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureReaderModal } from '../../lib/featureManagement';
import { ReaderLegacyLayoutToggleButton } from '../post/reader/ReaderHeaderActionButtons';
import { useLegacyPostLayoutOptOut } from '../post/reader/hooks/useLegacyPostLayoutOptOut';

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
  ...props
}: ArticlePostModalProps): ReactElement {
  const { position, onLoad } = usePostNavigationPosition({
    isDisplayed: props.isOpen,
    offset: 0,
  });
  const { value: isReaderModalEnabled } = useConditionalFeature({
    feature: featureReaderModal,
    shouldEvaluate: true,
  });
  const { isOptedOut: isLegacyLayoutOptedOut } = useLegacyPostLayoutOptOut();

  return (
    <BasePostModal
      {...props}
      post={post}
      onAfterOpen={onLoad}
      onRequestClose={onRequestClose}
      postType={PostType.Article}
      source={post.source}
      loadingClassName="!pb-2 tablet:pb-0"
      postPosition={postPosition}
      onPreviousPost={onPreviousPost}
      onNextPost={onNextPost}
      navigationCustomActions={
        isReaderModalEnabled ? (
          <ReaderLegacyLayoutToggleButton
            target={isLegacyLayoutOptedOut ? 'reader' : 'classic'}
          />
        ) : null
      }
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
      />
    </BasePostModal>
  );
}
