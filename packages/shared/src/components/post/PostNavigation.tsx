import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import ArrowIcon from '../../../icons/arrow.svg';
import { Button } from '../buttons/Button';

const SimpleTooltip = dynamic(() => import('../tooltips/SimpleTooltip'));

export interface PostNavigationProps {
  onPreviousPost: () => Promise<unknown>;
  onNextPost: () => Promise<unknown>;
}

export function PostNavigation({
  onPreviousPost,
  onNextPost,
}: PostNavigationProps): ReactElement {
  return (
    <div className="flex flex-row gap-2">
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
