import React, { ReactElement } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import ArrowIcon from '../../../icons/arrow.svg';
import { Button } from '../buttons/Button';
import { PostModalActions, PostModalActionsProps } from './PostModalActions';

const SimpleTooltip = dynamic(() => import('../tooltips/SimpleTooltip'));

export interface PostNavigationProps
  extends Pick<PostModalActionsProps, 'post' | 'onClose'> {
  onPreviousPost: () => unknown;
  onNextPost: () => unknown;
  shouldDisplayTitle?: boolean;
  className?: string;
}

export function PostNavigation({
  onPreviousPost,
  onNextPost,
  shouldDisplayTitle,
  className,
  post,
  onClose,
}: PostNavigationProps): ReactElement {
  const published = `Published on ${post?.source.name}`;
  const subtitle = !post?.author
    ? published
    : `${published} by ${post?.author.name}`;
  const content = { title: post?.title, subtitle };

  return (
    <div
      className={classNames('flex flex-row gap-2 items-center', className)}
      role="navigation"
    >
      <SimpleTooltip content="Previous">
        <Button
          className="-rotate-90 btn-secondary"
          icon={<ArrowIcon />}
          onClick={onPreviousPost}
        />
      </SimpleTooltip>
      <SimpleTooltip content="Next">
        <Button
          className="rotate-90 btn-secondary"
          icon={<ArrowIcon />}
          onClick={onNextPost}
        />
      </SimpleTooltip>
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
        post={post}
        onClose={onClose}
        inlineActions
        className={shouldDisplayTitle ? 'flex' : 'flex tablet:hidden ml-auto'}
        notificactionClassName="ml-4"
      />
    </div>
  );
}
