import classNames from 'classnames';
import React, { ReactElement } from 'react';
import PostNavigation, { PostNavigationProps } from './PostNavigation';

function FixedPostNavigation({
  onPreviousPost,
  onNextPost,
  postPosition,
  post,
  className = {},
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
      post={post}
      className={{
        container: classNames(
          'fixed z-3 w-full bg-theme-bg-secondary border border-theme-divider-tertiary py-4 px-6 top-0 ml-0',
          'laptop:left-[unset] max-w-full',
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
          'overflow-hidden flex-col flex-1 ml-2',
          hasNavigation && 'hidden tablet:flex',
        )}
      >
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-theme-label-tertiary typo-footnote">
          {content.subtitle}
        </span>
        <h3 className="overflow-hidden text-ellipsis whitespace-nowrap font-bold typo-headline">
          {content.title}
        </h3>
      </div>
    </PostNavigation>
  );
}

export default FixedPostNavigation;
