import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { PostModalActions } from './PostModalActions';
import ConditionalWrapper from '../ConditionalWrapper';
import { PostNavigationProps } from './common';
import { ArticleOnboardingVersion } from '../../lib/featureValues';

export function PostNavigation({
  onPreviousPost,
  onNextPost,
  shouldDisplayTitle,
  className,
  isModal,
  post,
  articleOnboardingVersion,
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
    <div
      className={classNames(
        'flex flex-row tablet:flex-col',
        !shouldDisplayTitle &&
          articleOnboardingVersion !== ArticleOnboardingVersion.V2 &&
          !isModal &&
          'pt-6 tablet:pt-0',
        isModal &&
          articleOnboardingVersion !== ArticleOnboardingVersion.V2 &&
          'pt-6 tablet:pt-6',
      )}
    >
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
        <>
          {postFeedFiltersOnboarding ||
            (postPreviousNext && (
              <div
                role="navigation"
                className={classNames(
                  'flex relative flex-row gap-2 items-center',
                )}
              >
                {postPreviousNext}
              </div>
            ))}
          {}
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
      </ConditionalWrapper>
    </div>
  );
}
