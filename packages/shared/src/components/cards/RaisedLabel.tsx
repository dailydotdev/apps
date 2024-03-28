import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import classed from '../../lib/classed';
import styles from './Card.module.css';

export enum RaisedLabelType {
  Hot = 'Hot',
  Pinned = 'Pinned',
  Beta = 'Beta',
}

const typeToClassName: Record<RaisedLabelType, string> = {
  [RaisedLabelType.Hot]: 'bg-status-error',
  [RaisedLabelType.Pinned]: 'bg-status-warning',
  [RaisedLabelType.Beta]: 'bg-raw-cabbage-40',
};

export interface RaisedLabelProps {
  listMode?: boolean;
  type: RaisedLabelType;
  description?: string;
  className?: string | undefined;
}

export const RaisedLabelContainer = classed(
  'div',
  `relative`,
  styles.cardContainer,
);

export function RaisedLabel({
  listMode,
  type = RaisedLabelType.Hot,
  description,
  className,
}: RaisedLabelProps): ReactElement {
  return (
    <div
      className={classNames(
        'absolute flex items-start overflow-hidden',
        listMode ? 'right-full top-0 mt-5' : 'bottom-full left-0 ml-5 h-5',
        className,
      )}
    >
      <SimpleTooltip content={description}>
        <div
          className={classNames(
            'flex items-center px-1',
            styles.flag,
            typeToClassName[type],
            listMode
              ? 'h-5 w-full justify-center rounded-l-4 mouse:translate-x-9'
              : 'h-full flex-col rounded-t-4 mouse:translate-y-4',
          )}
        >
          <span className="font-bold uppercase text-white typo-caption2">
            {type}
          </span>
        </div>
      </SimpleTooltip>
      {!listMode && description && (
        <span className="ml-2 text-text-tertiary typo-footnote mouse:hidden">
          {description}
        </span>
      )}
    </div>
  );
}
