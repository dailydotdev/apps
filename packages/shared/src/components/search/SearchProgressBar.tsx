import React, { ReactElement } from 'react';
import classNames from 'classnames';
import styles from './SearchProgressBar.module.css';

export interface SearchProgressBarProps {
  progress: number;
  max: number;
}

export const SearchProgressBar = ({
  progress = -1,
  max = 0,
}: SearchProgressBarProps): ReactElement => {
  const isDone = progress >= max;

  return (
    <div className="flex relative gap-3 h-2" data-testId="SearchProgressBar">
      {Array.from({ length: max }).map((_, index) => (
        <span
          /* eslint-disable-next-line react/no-array-index-key */
          key={index}
          className={classNames(
            'flex-1 h-2 rounded-10 relative overflow-hidden z-0',
            index < progress || isDone
              ? 'bg-theme-status-cabbage'
              : 'bg-theme-float',
          )}
        >
          {index === progress && !isDone && (
            <span
              className={classNames(
                styles.animatedBar,
                'rounded-10 h-2 w-3/5 absolute',
              )}
            />
          )}
        </span>
      ))}
    </div>
  );
};
