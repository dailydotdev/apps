import React, { ReactElement } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import ArrowIcon from '../../../icons/arrow.svg';
import { Button } from '../buttons/Button';
import { PostModalActions, PostModalActionsProps } from './PostModalActions';

const SimpleTooltip = dynamic(() => import('../tooltips/SimpleTooltip'));

interface Content {
  title: string;
  subtitle: string;
}

export interface PostNavigationProps {
  onPreviousPost: () => Promise<unknown>;
  onNextPost: () => Promise<unknown>;
  shouldDisplayTitle?: boolean;
  content?: Content;
  className?: string;
  postActionsProps: PostModalActionsProps;
}

export function PostNavigation({
  onPreviousPost,
  onNextPost,
  shouldDisplayTitle,
  content,
  className,
  postActionsProps,
}: PostNavigationProps): ReactElement {
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
