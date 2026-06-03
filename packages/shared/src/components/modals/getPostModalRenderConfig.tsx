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

const modalPostTypeByPostType: Partial<Record<PostType, PostType>> = {
  [PostType.Share]: PostType.Share,
  [PostType.Welcome]: PostType.Share,
  [PostType.Freeform]: PostType.Share,
  [PostType.Collection]: PostType.Collection,
  [PostType.Brief]: PostType.Brief,
  [PostType.Poll]: PostType.Poll,
  [PostType.SocialTwitter]: PostType.SocialTwitter,
};

const getModalPostType = (post: Post): PostType => {
  return modalPostTypeByPostType[post.type] ?? PostType.Article;
};

const articleLikeNavigationClassName = {
  container: '!w-[inherit]',
  actions: 'ml-auto',
};

const getArticleLikeClassName = (content?: string) => ({
  container: 'min-w-0',
  ...(content ? { content } : {}),
  fixedNavigation: articleLikeNavigationClassName,
  navigation: { actions: 'ml-auto tablet:hidden' },
  onboarding: 'mb-0 mt-8',
});

const getWideModalClassName = (
  size: NonNullable<ModalProps['size']>,
  hideBreakpoint: string,
) => ({
  onboarding: 'mt-8',
  navigation: { actions: `ml-auto ${hideBreakpoint}:hidden` },
  fixedNavigation: {
    container: modalSizeToClassName[size],
    actions: 'ml-auto',
  },
});

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
  const commonProps = {
    position,
    post,
    postPosition,
    onPreviousPost,
    onNextPost,
    inlineActions: true,
    hideSubscribeAction,
    onClose: onRequestClose,
  };

  switch (modalPostType) {
    case PostType.Share:
      return {
        postType: PostType.Share,
        loadingClassName: '!pb-2 tablet:pb-0',
        content: (
          <SquadPostContent
            {...commonProps}
            origin={Origin.ArticleModal}
            className={getArticleLikeClassName('pt-2')}
          />
        ),
      };
    case PostType.Poll:
      return {
        postType: PostType.Poll,
        loadingClassName: '!pb-2 tablet:pb-0',
        content: (
          <PollPostContent
            {...commonProps}
            origin={Origin.ArticleModal}
            className={getArticleLikeClassName()}
          />
        ),
      };
    case PostType.Collection:
      return {
        postType: PostType.Collection,
        loadingClassName: '!pb-2 laptop:pb-0',
        content: (
          <CollectionPostContent
            {...commonProps}
            className={getWideModalClassName(Modal.Size.XLarge, 'laptop')}
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
            {...commonProps}
            className={getWideModalClassName(Modal.Size.Large, 'laptop')}
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
            {...commonProps}
            origin={Origin.ArticleModal}
            className={getArticleLikeClassName()}
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
            {...commonProps}
            className={{
              container: 'min-w-0',
              onboarding: 'mt-8',
              navigation: { actions: 'ml-auto tablet:hidden' },
              fixedNavigation: {
                container: modalSizeToClassName[Modal.Size.XLarge],
                actions: 'ml-auto',
              },
            }}
            origin={Origin.ArticleModal}
          />
        ),
      };
  }
};
