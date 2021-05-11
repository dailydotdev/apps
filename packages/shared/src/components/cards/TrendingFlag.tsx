import React, { ReactElement } from 'react';
import { getTooltipProps } from '../../lib/tooltip';
import styles from './Card.module.css';
import classNames from 'classnames';

export default function TrendingFlag({
  trending,
  listMode,
}: {
  trending: number;
  listMode?: boolean;
}): ReactElement {
  const description = `${trending} devs read it last hour`;
  return (
    <div
      className={classNames(
        'absolute flex items-start',
        listMode ? 'top-0 right-full w-10 mt-5' : 'left-0 bottom-full ml-5 h-5',
      )}
    >
      <div
        className={classNames(
          'flex items-center bg-theme-status-error transform',
          styles.flag,
          listMode
            ? 'h-5 w-full justify-center mouse:translate-x-9 rounded-l'
            : 'w-10 h-full flex-col mouse:translate-y-4 rounded-t',
        )}
        {...getTooltipProps(description)}
      >
        <span className="typo-caption2 uppercase font-bold">Hot</span>
      </div>
      {!listMode && (
        <span className="ml-2 typo-footnote text-theme-label-tertiary mouse:hidden">
          {description}
        </span>
      )}
    </div>
  );
}
