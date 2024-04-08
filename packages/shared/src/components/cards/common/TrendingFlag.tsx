import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { TrendingIcon } from '../../icons';
import { IconSize } from '../../Icon';

interface TrendingFlagProps {
  iconOnly?: boolean;
  className?: {
    container?: string;
  };
}
export const TrendingFlag = ({
  iconOnly = false,
  className,
}: TrendingFlagProps): ReactElement => {
  return (
    <div
      className={classNames(
        'absolute z-1 flex h-8 items-center rounded-10 bg-action-downvote-default py-1 font-bold text-white typo-callout laptop:mouse:group-hover:invisible',
        iconOnly ? 'px-1' : 'px-3',
        className?.container,
      )}
    >
      {!iconOnly && 'Trending'}
      <TrendingIcon
        className={classNames(!iconOnly && 'ml-1')}
        secondary
        size={IconSize.Small}
      />
    </div>
  );
};
