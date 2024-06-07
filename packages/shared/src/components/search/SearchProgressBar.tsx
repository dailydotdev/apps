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
    <div className="relative flex h-2 gap-3" data-testid="SearchProgressBar">
      {Array.from({ length: max }).map((_, index) => (
        <span
          /* eslint-disable-next-line react/no-array-index-key */
          key={index}
          className={classNames(
            'relative z-0 h-2 flex-1 overflow-hidden rounded-10',
            index < progress || isDone
              ? 'bg-accent-cabbage-default'
              : 'bg-surface-float',
          )}
        >
          {index === progress && !isDone && (
            <span
              className={classNames(
                styles.animatedBar,
                'absolute h-2 w-3/5 rounded-10',
              )}
            />
          )}
        </span>
      ))}
    </div>
  );
};
