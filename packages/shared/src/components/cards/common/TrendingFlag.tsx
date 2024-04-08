import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { TrendingIcon } from '../../icons';
import { IconSize } from '../../Icon';

interface TrendingFlagProps {
  className?: {
    container?: string;
  };
}
export const TrendingFlag = ({
  className,
}: TrendingFlagProps): ReactElement => {
  return (
    <div
      className={classNames(
        'absolute z-1 flex h-8 items-center rounded-10 bg-action-downvote-default px-3 py-1 font-bold text-white typo-callout laptop:mouse:group-hover:invisible',
        className?.container,
      )}
    >
      Trending <TrendingIcon className="ml-1" secondary size={IconSize.Small} />
    </div>
  );
};
