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
          'fixed z-postNavigation ml-0 w-full border-b border-border-subtlest-tertiary bg-background-subtle px-4 py-1 laptop:border laptop:px-6',
          'max-w-full laptop:left-[unset]',
          isBannerVisible ? 'top-14' : 'top-0',
          className?.container,
        ),
        actions: className?.actions,
      }}
      onPreviousPost={onPreviousPost}
      onNextPost={onNextPost}
      postPosition={postPosition}
      buttonSize={ButtonSize.Medium}
    />
  );
}

export default FixedPostNavigation;
