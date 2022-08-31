import React, { ReactElement } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import ArrowIcon from '../icons/Arrow';
import { Button } from '../buttons/Button';
import { PostModalActions, PostModalActionsProps } from './PostModalActions';

const SimpleTooltip = dynamic(() => import('../tooltips/SimpleTooltip'));

export interface PostNavigationProps
  extends Pick<
    PostModalActionsProps,
    'post' | 'onClose' | 'onShare' | 'onBookmark' | 'onReadArticle'
  > {
  onPreviousPost: () => unknown;
  onNextPost: () => unknown;
  shouldDisplayTitle?: boolean;
  isModal?: boolean;
  className?: string;
  additionalInteractionButtonFeature: string;
}

export function PostNavigation({
  onPreviousPost,
  onNextPost,
  shouldDisplayTitle,
  className,
  isModal,
  post,
  onReadArticle,
  onClose,
  onShare,
  onBookmark,
  additionalInteractionButtonFeature,
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
      className={classNames('flex flex-row gap-2 items-center', className)}
      role="navigation"
    >
      {onPreviousPost && (
        <SimpleTooltip content="Previous">
          <Button
            className="-rotate-90 btn-secondary"
            icon={<ArrowIcon />}
            onClick={onPreviousPost}
          />
        </SimpleTooltip>
      )}
      {onNextPost && (
        <SimpleTooltip content="Next">
          <Button
            className="rotate-90 btn-secondary"
            icon={<ArrowIcon />}
            onClick={onNextPost}
          />
        </SimpleTooltip>
      )}
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
        additionalInteractionButtonFeature={additionalInteractionButtonFeature}
        post={post}
        onClose={onClose}
        inlineActions={shouldDisplayTitle || isModal}
        className={getClasses()}
        notificactionClassName="ml-4"
        contextMenuId="post-navigation-context"
      />
    </div>
  );
}
