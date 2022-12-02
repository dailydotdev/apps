import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { PostModalActions } from './PostModalActions';
import ConditionalWrapper from '../ConditionalWrapper';
import { PostNavigationProps } from './common';

export function PostNavigation({
  onPreviousPost,
  onNextPost,
  shouldDisplayTitle,
  className,
  isModal,
  post,
  postFeedFiltersOnboarding,
  postPreviousNext,
  onReadArticle,
  onClose,
  onShare,
  onBookmark,
}: PostNavigationProps): ReactElement {
  const published = `Published on ${post?.source.name}`;
  const subtitle = !post?.author
    ? published
    : `${published} by ${post?.author.name}`;
  const content = { title: post?.title, subtitle };
  const isEmptyNavigation = !onPreviousPost && !onNextPost;

  const getClasses = () => {
    if (shouldDisplayTitle) {
      return classNames('flex');
    }

    if (isEmptyNavigation) {
      return 'flex grow tablet:hidden';
    }

    return 'flex tablet:hidden ml-auto';
  };

  return (
    <>
      <ConditionalWrapper
        condition={shouldDisplayTitle}
        wrapper={(children) => (
          <div
            className={classNames(
              'flex flex-row gap-2 items-center',
              className,
            )}
            role="navigation"
          >
            {children}
          </div>
        )}
      >
        {postFeedFiltersOnboarding || postPreviousNext}
        {shouldDisplayTitle && (
          <div className="overflow-hidden flex-col flex-1 ml-2">
            <span className="overflow-hidden whitespace-nowrap typo-footnote text-ellipsis text-theme-label-tertiary">
              {content.subtitle}
            </span>
            <h3 className="overflow-hidden font-bold whitespace-nowrap text-ellipsis typo-headline">
              {content.title}
            </h3>
          </div>
        )}
      </ConditionalWrapper>
      <PostModalActions
        onShare={onShare}
        onBookmark={onBookmark}
        onReadArticle={onReadArticle}
        post={post}
        onClose={onClose}
        inlineActions={shouldDisplayTitle || isModal}
        className={getClasses()}
        notificactionClassName="ml-4"
        contextMenuId="post-navigation-context"
      />
    </>
  );
}
