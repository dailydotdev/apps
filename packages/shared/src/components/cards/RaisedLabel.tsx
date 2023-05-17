import React, { ReactElement } from 'react';
import classNames from 'classnames';
import styles from './Card.module.css';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';

export function RaisedLabel({
  trending,
  listMode,
  type,
}: {
  trending: number;
  listMode?: boolean;
  type: 'hot' | 'pinned';
}): ReactElement {
  const description = `${trending} devs read it last hour`;
  return (
    <div
      className={classNames(
        'absolute flex items-start',
        listMode ? 'top-0 right-full mt-5' : 'left-0 bottom-full ml-5 h-5',
      )}
    >
      <SimpleTooltip content={description}>
        <div
          className={classNames(
            'flex items-center px-1',
            styles.flag,
            type === 'hot' ? 'bg-theme-status-error' : 'bg-theme-bg-bun',
            listMode
              ? 'h-5 w-full justify-center mouse:translate-x-9 rounded-l'
              : 'h-full flex-col mouse:translate-y-4 rounded-t',
          )}
        >
          <span className="font-bold text-white uppercase typo-caption2">
            {type === 'hot' ? 'Hot' : 'Pinned'}
          </span>
        </div>
      </SimpleTooltip>
      {!listMode && (
        <span className="mouse:hidden ml-2 typo-footnote text-theme-label-tertiary">
          {description}
        </span>
      )}
    </div>
  );
}
