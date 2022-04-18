import React, { ReactElement } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import ArrowIcon from '../../../icons/arrow.svg';
import { Button } from '../buttons/Button';
import { PostModalActions, PostModalActionsProps } from './PostModalActions';

const SimpleTooltip = dynamic(() => import('../tooltips/SimpleTooltip'));

export interface PostNavigationProps {
  onPreviousPost: () => Promise<unknown>;
  onNextPost: () => Promise<unknown>;
  shouldDisplayTitle?: boolean;
  className?: string;
  postActionsProps: PostModalActionsProps;
}

export function PostNavigation({
  onPreviousPost,
  onNextPost,
  shouldDisplayTitle,
  className,
  postActionsProps,
}: PostNavigationProps): ReactElement {
  const { post } = postActionsProps;
  const published = `Published on ${post?.source.name}`;
  const subtitle = !post?.author
    ? published
    : `${published} by ${post?.author.name}`;
  const content = { title: post?.title, subtitle };

  return (
    <div
      className={classNames('flex flex-row gap-2', className)}
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
      {shouldDisplayTitle && content && (
        <>
          <div className="flex overflow-hidden flex-col flex-1 ml-2">
            <span className="typo-footnote text-theme-label-tertiary">
              {content.subtitle}
            </span>
            <h3 className="overflow-hidden font-bold whitespace-nowrap text-ellipsis typo-headline">
              {content.title}
            </h3>
          </div>
          <PostModalActions {...postActionsProps} inlineActions />
        </>
      )}
    </div>
  );
}
