import type { CSSProperties, ReactElement } from 'react';
import React from 'react';
import { Modal, modalSizeToClassName } from './common/Modal';
import type { ModalProps } from './common/Modal';
import { PostContent } from '../post/PostContent';
import { SquadPostContent } from '../post/SquadPostContent';
import { PollPostContent } from '../post/poll/PollPostContent';
import { BriefPostContent } from '../post/brief/BriefPostContent';
import { CollectionPostContent } from '../post/collection/CollectionPostContent';
import { SocialTwitterPostContent } from '../post/SocialTwitterPostContent';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import type { PassedPostNavigationProps } from '../post/common';
import { Origin } from '../../lib/log';

export interface PostModalRenderConfig {
  content: ReactElement;
  loadingClassName: string;
  postType: PostType;
  size?: ModalProps['size'];
}

type GetPostModalRenderConfigProps = PassedPostNavigationProps & {
  onRequestClose?: ModalProps['onRequestClose'];
  position: CSSProperties['position'];
  post: Post;
  hideSubscribeAction?: boolean;
};

const getModalPostType = (post: Post): PostType => {
  switch (post.type) {
    case PostType.Share:
    case PostType.Welcome:
    case PostType.Freeform:
      return PostType.Share;
    case PostType.Collection:
      return PostType.Collection;
    case PostType.Brief:
      return PostType.Brief;
    case PostType.Poll:
      return PostType.Poll;
    case PostType.SocialTwitter:
      return PostType.SocialTwitter;
    case PostType.Article:
    case PostType.VideoYouTube:
    case PostType.Digest:
    default:
      return PostType.Article;
  }
};

export const getPostModalRenderConfig = ({
  onPreviousPost,
  onNextPost,
  postPosition,
  onRequestClose,
  position,
  post,
  hideSubscribeAction,
}: GetPostModalRenderConfigProps): PostModalRenderConfig => {
  const modalPostType = getModalPostType(post);

  switch (modalPostType) {
    case PostType.Share:
      return {
        postType: PostType.Share,
        loadingClassName: '!pb-2 tablet:pb-0',
        content: (
          <SquadPostContent
            position={position}
            post={post}
            onPreviousPost={onPreviousPost}
            onNextPost={onNextPost}
            postPosition={postPosition}
            inlineActions
            hideSubscribeAction={hideSubscribeAction}
            onClose={onRequestClose}
            origin={Origin.ArticleModal}
            className={{
              container: 'min-w-0',
              content: 'pt-2',
              fixedNavigation: {
                container: '!w-[inherit]',
                actions: 'ml-auto',
              },
              navigation: { actions: 'ml-auto tablet:hidden' },
              onboarding: 'mb-0 mt-8',
            }}
          />
        ),
      };
    case PostType.Poll:
      return {
        postType: PostType.Poll,
        loadingClassName: '!pb-2 tablet:pb-0',
        content: (
          <PollPostContent
            position={position}
            post={post}
            onPreviousPost={onPreviousPost}
            onNextPost={onNextPost}
            postPosition={postPosition}
            inlineActions
            hideSubscribeAction={hideSubscribeAction}
            onClose={onRequestClose}
            origin={Origin.ArticleModal}
            className={{
              container: 'min-w-0',
              fixedNavigation: {
                container: '!w-[inherit]',
                actions: 'ml-auto',
              },
              navigation: { actions: 'ml-auto tablet:hidden' },
              onboarding: 'mb-0 mt-8',
            }}
          />
        ),
      };
    case PostType.Collection:
      return {
        postType: PostType.Collection,
        loadingClassName: '!pb-2 laptop:pb-0',
        content: (
          <CollectionPostContent
            position={position}
            post={post}
            postPosition={postPosition}
            onPreviousPost={onPreviousPost}
            onNextPost={onNextPost}
            inlineActions
            hideSubscribeAction={hideSubscribeAction}
            className={{
              onboarding: 'mt-8',
              navigation: { actions: 'ml-auto laptop:hidden' },
              fixedNavigation: {
                container: modalSizeToClassName[Modal.Size.XLarge],
                actions: 'ml-auto',
              },
            }}
            onClose={onRequestClose}
            origin={Origin.CollectionModal}
          />
        ),
      };
    case PostType.Brief:
      return {
        postType: PostType.Brief,
        size: Modal.Size.Large,
        loadingClassName: '!pb-2 laptop:pb-0',
        content: (
          <BriefPostContent
            position={position}
            post={post}
            postPosition={postPosition}
            onPreviousPost={onPreviousPost}
            onNextPost={onNextPost}
            inlineActions
            hideSubscribeAction={hideSubscribeAction}
            className={{
              onboarding: 'mt-8',
              navigation: { actions: 'ml-auto laptop:hidden' },
              fixedNavigation: {
                container: modalSizeToClassName[Modal.Size.Large],
                actions: 'ml-auto',
              },
            }}
            onClose={onRequestClose}
            origin={Origin.BriefModal}
          />
        ),
      };
    case PostType.SocialTwitter:
      return {
        postType: PostType.SocialTwitter,
        loadingClassName: '!pb-2 tablet:pb-0',
        content: (
          <SocialTwitterPostContent
            position={position}
            post={post}
            onPreviousPost={onPreviousPost}
            onNextPost={onNextPost}
            postPosition={postPosition}
            inlineActions
            hideSubscribeAction={hideSubscribeAction}
            onClose={onRequestClose}
            origin={Origin.ArticleModal}
            className={{
              container: 'min-w-0',
              fixedNavigation: {
                container: '!w-[inherit]',
                actions: 'ml-auto',
              },
              navigation: { actions: 'ml-auto tablet:hidden' },
              onboarding: 'mb-0 mt-8',
            }}
          />
        ),
      };
    case PostType.Article:
    default:
      return {
        postType: PostType.Article,
        loadingClassName: '!pb-2 tablet:pb-0',
        content: (
          <PostContent
            position={position}
            post={post}
            postPosition={postPosition}
            onPreviousPost={onPreviousPost}
            onNextPost={onNextPost}
            inlineActions
            hideSubscribeAction={hideSubscribeAction}
            className={{
              container: 'min-w-0',
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
        ),
      };
  }
};
