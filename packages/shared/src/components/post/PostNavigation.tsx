import React, { ReactElement } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import ArrowIcon from '../../../icons/arrow.svg';
import { Button } from '../buttons/Button';

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
}

export function PostNavigation({
  onPreviousPost,
  onNextPost,
  shouldDisplayTitle,
  content,
  className,
}: PostNavigationProps): ReactElement {
  return (
    <div className={classNames('flex flex-row gap-2', className)}>
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
        <div className="flex flex-col pr-8 ml-2">
          <span className="typo-footnote text-theme-label-tertiary">
            {content.subtitle}
          </span>
          <h3 className="font-bold typo-headline">{content.title}</h3>
        </div>
      )}
    </div>
  );
}
