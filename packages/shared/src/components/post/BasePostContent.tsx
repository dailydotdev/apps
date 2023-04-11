import classNames from 'classnames';
import dynamic from 'next/dynamic';
import React, { ReactElement, ReactNode, useContext } from 'react';
import { Post } from '../../graphql/posts';
import PostNavigation, {
  PostNavigationClassName,
  PostNavigationProps,
} from './PostNavigation';
import { PostLoadingPlaceholder } from './PostLoadingPlaceholder';
import { PostFeedFiltersOnboarding } from './PostFeedFiltersOnboarding';
import PostEngagements from './PostEngagements';
import PostContentContainer from './PostContentContainer';
import {
  UsePostContent,
  UsePostContentProps,
} from '../../hooks/usePostContent';
import OnboardingContext from '../../contexts/OnboardingContext';

const ShareModal = dynamic(
  () => import(/* webpackChunkName: "shareModal" */ '../modals/ShareModal'),
);

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "custom404" */ '../Custom404'),
);

export interface PostContentClassName {
  container?: string;
  content?: string;
  onboarding?: string;
  navigation?: PostNavigationClassName;
  fixedNavigation?: PostNavigationClassName;
}

export interface BasePostContentProps extends UsePostContentProps {
  post: Post;
  children: ReactNode;
  isFallback?: boolean;
  className?: PostContentClassName;
  navigationProps?: PostNavigationProps;
  engagementProps: UsePostContent;
  shouldOnboardAuthor?: boolean;
  enableShowShareNewComment?: boolean;
  loadingPlaceholder?: ReactNode;
  customNavigation?: ReactNode;
}

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

  if (!id && !isFallback) return <Custom404 />;

  const { onCloseShare, sharePost, onSharePost, onToggleBookmark } =
    engagementProps;
  const { onStartArticleOnboarding, showArticleOnboarding } =
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
      {children}
      <PostEngagements
        post={post}
        onShare={onSharePost}
        analyticsOrigin={origin}
        onBookmark={onToggleBookmark}
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
