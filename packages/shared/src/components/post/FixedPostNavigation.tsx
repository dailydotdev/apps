import classNames from 'classnames';
import React, { ReactElement } from 'react';
import PostNavigation from './PostNavigation';
import { PostNavigationProps } from './common';

function FixedPostNavigation({
  onPreviousPost,
  onNextPost,
  postPosition,
  post,
  className = {},
  isBannerVisible,
  ...props
}: PostNavigationProps): ReactElement {
  const published = `Published on ${post?.source.name}`;
  const subtitle = !post?.author
    ? published
    : `${published} by ${post?.author.name}`;
  const content = { title: post?.title, subtitle };
  const hasNavigation = !!onPreviousPost || !!onNextPost;

  return (
    <PostNavigation
      {...props}
      inlineActions
      isFixedNavigation
      post={post}
      contextMenuId="fixed-post-navigation-context"
      className={{
        container: classNames(
          'fixed z-postNavigation ml-0 w-full border border-border-subtlest-tertiary bg-background-subtle px-6 py-4',
          'max-w-full laptop:left-[unset]',
          isBannerVisible ? 'top-14' : 'top-0',
          className?.container,
        ),
        actions: className?.actions,
      }}
      onPreviousPost={onPreviousPost}
      onNextPost={onNextPost}
      postPosition={postPosition}
    >
      <div
        className={classNames(
          'ml-2 flex-1 flex-col overflow-hidden',
          hasNavigation && 'hidden laptop:flex',
        )}
      >
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-text-tertiary typo-footnote">
          {content.subtitle}
        </span>
        <h3 className="overflow-hidden text-ellipsis whitespace-nowrap font-bold typo-body">
          {content.title}
        </h3>
      </div>
    </PostNavigation>
  );
}

export default FixedPostNavigation;
