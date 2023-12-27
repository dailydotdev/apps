import dynamic from 'next/dynamic';
import React, { ReactElement, useContext } from 'react';
import PostNavigation from './PostNavigation';
import { PostFeedFiltersOnboarding } from './PostFeedFiltersOnboarding';
import PostEngagements from './PostEngagements';
import OnboardingContext from '../../contexts/OnboardingContext';
import { BasePostContentProps } from './common';
import { PostType } from '../../graphql/posts';

const ShareModal = dynamic(
  () => import(/* webpackChunkName: "shareModal" */ '../modals/ShareModal'),
);

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "custom404" */ '../Custom404'),
);

const withPillTypes = [PostType.Collection, PostType.VideoYouTube];

const typeToLabel = {
  [PostType.Collection]: 'Collection',
  [PostType.VideoYouTube]: 'Video',
};

export const ONBOARDING_OFFSET = 120;

export function BasePostContent({
  post,
  isFallback,
  origin,
  children,
  className = {},
  navigationProps,
  engagementProps,
  shouldOnboardAuthor,
  enableShowShareNewComment,
  customNavigation,
}: BasePostContentProps): ReactElement {
  const { id } = post ?? {};

  if (!id && !isFallback) {
    return <Custom404 />;
  }

  const { onCloseShare, sharePost, onSharePost } = engagementProps;
  const { onStartArticleOnboarding, showArticleOnboarding } =
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useContext(OnboardingContext);

  return (
    <>
      {showArticleOnboarding && (
        <PostFeedFiltersOnboarding
          className={className?.onboarding}
          onInitializeOnboarding={onStartArticleOnboarding}
        />
      )}
      {customNavigation ?? (
        <PostNavigation {...navigationProps} className={className.navigation} />
      )}
      {withPillTypes.includes(post?.type) && (
        <span className="py-2 px-3 mt-6 font-bold capitalize rounded-8 bg-theme-overlay-float-cabbage text-theme-color-cabbage typo-footnote w-fit">
          {typeToLabel[post.type]}
        </span>
      )}
      {children}
      <PostEngagements
        post={post}
        onShare={onSharePost}
        analyticsOrigin={origin}
        shouldOnboardAuthor={shouldOnboardAuthor}
        enableShowShareNewComment={enableShowShareNewComment}
      />
      {sharePost && (
        <ShareModal
          isOpen={!!sharePost}
          post={post}
          origin={origin}
          onRequestClose={onCloseShare}
        />
      )}
    </>
  );
}
