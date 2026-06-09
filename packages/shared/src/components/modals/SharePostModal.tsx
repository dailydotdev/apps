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
import { SquadPostContent } from '../post/SquadPostContent';
import { isSourceUserSource } from '../../graphql/sources';
import { usePostDiscoveryExperience } from '../../hooks/post/usePostDiscoveryExperience';
import { PostFocusCard } from '../post/discovery/PostFocusCard';

interface PostModalProps extends ModalProps, PassedPostNavigationProps {
  id: string;
  post: Post;
}

export default function PostModal({
  id,
  className,
  onRequestClose,
  onPreviousPost,
  onNextPost,
  postPosition,
  post,
  ...props
}: PostModalProps): ReactElement {
  const { position, onLoad } = usePostNavigationPosition({
    isDisplayed: props.isOpen,
    offset: 0,
  });
  const { showDiscovery } = usePostDiscoveryExperience(post);

  return (
    <BasePostModal
      {...props}
      post={post}
      onAfterOpen={onLoad}
      size={showDiscovery ? Modal.Size.Large : Modal.Size.XLarge}
      className={showDiscovery ? 'laptop:!overflow-visible' : undefined}
      onRequestClose={onRequestClose}
      postType={PostType.Share}
      source={post.source}
      loadingClassName="!pb-2 tablet:pb-0"
      postPosition={postPosition}
      onPreviousPost={onPreviousPost}
      onNextPost={onNextPost}
    >
      {showDiscovery ? (
        <PostFocusCard
          post={post}
          origin={Origin.ArticleModal}
          onClose={() => onRequestClose?.(undefined as never)}
        />
      ) : (
        <>
          <EnableNotification
            source={NotificationPromptSource.SquadPostModal}
            label={
              isSourceUserSource(post?.source)
                ? post?.author?.username
                : post?.source?.handle
            }
          />
          <SquadPostContent
            position={position}
            post={post}
            onPreviousPost={onPreviousPost}
            onNextPost={onNextPost}
            postPosition={postPosition}
            inlineActions
            onClose={onRequestClose}
            origin={Origin.ArticleModal}
            className={{
              fixedNavigation: {
                container: '!w-[inherit]',
                actions: 'ml-auto',
              },
              navigation: { actions: 'ml-auto tablet:hidden' },
              onboarding: 'mb-0 mt-8',
            }}
          />
        </>
      )}
    </BasePostModal>
  );
}
