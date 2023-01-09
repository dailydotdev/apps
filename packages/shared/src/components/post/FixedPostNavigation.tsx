import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { PostNavigation, PostNavigationProps } from './PostNavigation';

function FixedPostNavigation({
  onPreviousPost,
  onNextPost,
  post,
  className = {},
  ...props
}: PostNavigationProps): ReactElement {
  const published = `Published on ${post?.source.name}`;
  const subtitle = !post?.author
    ? published
    : `${published} by ${post?.author.name}`;
  const content = { title: post?.title, subtitle };

  return (
    <PostNavigation
      {...props}
      inlineActions
      post={post}
      className={{
        container: classNames(
          'fixed z-3 w-full bg-theme-bg-secondary border-b border-theme-divider-tertiary py-4 px-6 top-0 left-0 ml-0 laptop:left-[unset] laptop:-ml-8',
          className?.container,
        ),
        actions: className?.actions,
      }}
      onPreviousPost={onPreviousPost}
      onNextPost={onNextPost}
    >
      <div className="overflow-hidden flex-col flex-1 ml-2">
        <span className="overflow-hidden whitespace-nowrap typo-footnote text-ellipsis text-theme-label-tertiary">
          {content.subtitle}
        </span>
        <h3 className="overflow-hidden font-bold whitespace-nowrap text-ellipsis typo-headline">
          {content.title}
        </h3>
      </div>
    </PostNavigation>
  );
}

export default FixedPostNavigation;
