import React, { ReactElement } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import ArrowIcon from '../../../icons/arrow.svg';
import { Button } from '../buttons/Button';

const SimpleTooltip = dynamic(() => import('../tooltips/SimpleTooltip'));

export interface PostNavigationProps {
  onPreviousPost: () => Promise<unknown>;
  onNextPost: () => Promise<unknown>;
  className?: string;
}

export function PostNavigation({
  onPreviousPost,
  onNextPost,
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
    </div>
  );
}
