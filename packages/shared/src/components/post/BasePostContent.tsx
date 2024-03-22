import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import PostNavigation from './PostNavigation';
import PostEngagements from './PostEngagements';
import { BasePostContentProps } from './common';

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
  const { onCloseShare, sharePost, onCopyPostLink } = engagementProps;

  if (!id && !isFallback) {
    return <Custom404 />;
  }

  return (
    <>
      {customNavigation ?? (
        <PostNavigation {...navigationProps} className={className.navigation} />
      )}
      {children}
      <PostEngagements
        post={post}
        onShare={onCopyPostLink}
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
