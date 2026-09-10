import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import PostNavigation from './PostNavigation';
import type { PostNavigationProps } from './common';
import { ButtonSize } from '../buttons/Button';

function FixedPostNavigation({
  onPreviousPost,
  onNextPost,
  postPosition,
  post,
  className = {},
  isBannerVisible,
  ...props
}: PostNavigationProps): ReactElement {
  return (
    <PostNavigation
      {...props}
      inlineActions
      isFixedNavigation
      post={post}
      contextMenuId="fixed-post-navigation-context"
      className={{
        container: classNames(
          'fixed z-postNavigation ml-0 w-full border-b border-border-subtlest-tertiary px-4 laptop:border laptop:px-6',
          'max-w-full laptop:left-[unset]',
          // The auth banner's height, plus the pinned phone ad strip when
          // it renders (0 otherwise).
          isBannerVisible
            ? 'top-[calc(3.5rem+var(--phone-top-ad-height,0px))]'
            : 'top-[var(--phone-top-ad-height,0px)]',
          className?.container,
        ),
        actions: className?.actions,
      }}
      onPreviousPost={onPreviousPost}
      onNextPost={onNextPost}
      postPosition={postPosition}
      buttonSize={ButtonSize.Small}
    />
  );
}

export default FixedPostNavigation;
