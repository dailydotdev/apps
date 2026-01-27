import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import classed from '../../../lib/classed';
import styles from './Card.module.css';
import { Tooltip } from '../../tooltip/Tooltip';
import ConditionalWrapper from '../../ConditionalWrapper';

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
  /** Used in list cards to adjust position based on focus state */
  focus?: boolean;
}

export const RaisedLabelContainer = classed(
  'div',
  `relative`,
  styles.cardContainer,
);

/**
 * Grid mode (default): Label appears above the card with hover animation
 * List mode with focus: Label appears inside the card on the right
 */
export function RaisedLabel({
  listMode,
  type = RaisedLabelType.Hot,
  description,
  className,
  focus = false,
}: RaisedLabelProps): ReactElement {
  // List mode with focus prop uses simplified inline positioning
  if (listMode && focus !== undefined) {
    return (
      <div
        className={classNames(
          'absolute right-3 flex flex-row group-focus:-top-0.5',
          !focus && '-top-px',
          focus && '-top-0.5',
          className,
        )}
      >
        <ConditionalWrapper
          condition={description?.length > 0}
          wrapper={(children) => (
            <Tooltip content={description}>{children}</Tooltip>
          )}
        >
          <div
            className={classNames(
              'relative -top-2 flex h-4 rounded-4 px-2 font-bold uppercase text-white typo-caption2',
              typeToClassName[type],
            )}
          >
            {type}
          </div>
        </ConditionalWrapper>
      </div>
    );
  }

  // Grid mode (default) or list mode without focus - uses CSS module animations
  return (
    <div
      className={classNames(
        'absolute flex items-start overflow-hidden',
        listMode ? 'right-full top-0 mt-5' : 'bottom-full left-0 ml-5 h-5',
        className,
      )}
    >
      <ConditionalWrapper
        condition={description?.length > 0}
        wrapper={(children) => (
          <Tooltip content={description}>{children}</Tooltip>
        )}
      >
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
      </ConditionalWrapper>
      {!listMode && description && (
        <span className="ml-2 text-text-tertiary typo-footnote mouse:hidden">
          {description}
        </span>
      )}
    </div>
  );
}
