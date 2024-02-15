import dynamic from 'next/dynamic';
import React, { ReactElement, useContext } from 'react';
import PostNavigation from './PostNavigation';
import { PostFeedFiltersOnboarding } from './PostFeedFiltersOnboarding';
import PostEngagements from './PostEngagements';
import OnboardingContext from '../../contexts/OnboardingContext';
import { BasePostContentProps } from './common';
import { useOnboarding } from '../../hooks/auth';

const ShareModal = dynamic(
  () => import(/* webpackChunkName: "shareModal" */ '../modals/ShareModal'),
);

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "custom404" */ '../Custom404'),
);

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
  const { onCloseShare, sharePost, onSharePost } = engagementProps;
  const { onStartArticleOnboarding, showArticleOnboarding } =
    useContext(OnboardingContext);
  const { shouldShowAuthBanner } = useOnboarding();

  if (!id && !isFallback) {
    return <Custom404 />;
  }

  return (
    <>
      {showArticleOnboarding && !shouldShowAuthBanner && (
        <PostFeedFiltersOnboarding
          className={className?.onboarding}
          onInitializeOnboarding={onStartArticleOnboarding}
        />
      )}
      {customNavigation ?? (
        <PostNavigation {...navigationProps} className={className.navigation} />
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
