import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import classNames from 'classnames';
import PostNavigation from './PostNavigation';
import PostEngagements from './PostEngagements';
import { BasePostContentProps } from './common';
import { PostHeaderActions } from './PostHeaderActions';

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "custom404" */ '../Custom404'),
);

const GoBackHeaderMobile = dynamic(
  () =>
    import(/* webpackChunkName: "goBackHeaderMobile" */ './GoBackHeaderMobile'),
  { ssr: false },
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
  isPostPage,
}: BasePostContentProps): ReactElement {
  const { id } = post ?? {};
  const { onCopyPostLink } = engagementProps;

  if (!id && !isFallback) {
    return <Custom404 />;
  }

  return (
    <>
      {isPostPage ? (
        <GoBackHeaderMobile className={classNames(className.header, '-mx-4')}>
          <PostHeaderActions
            post={post}
            className="ml-auto"
            contextMenuId="post-page-header-actions"
            onReadArticle={navigationProps.onReadArticle}
          />
        </GoBackHeaderMobile>
      ) : (
        <PostNavigation {...navigationProps} className={className.navigation} />
      )}
      {children}
      <PostEngagements
        post={post}
        onCopyLinkClick={onCopyPostLink}
        logOrigin={origin}
        shouldOnboardAuthor={shouldOnboardAuthor}
      />
    </>
  );
}
