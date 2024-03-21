import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { RaisedLabelType } from '../../../cards/RaisedLabel';
import { SimpleTooltip } from '../../../tooltips';
import styles from '../../../cards/Card.module.css';

const typeToClassName: Record<RaisedLabelType, string> = {
  [RaisedLabelType.Hot]: 'bg-theme-status-error',
  [RaisedLabelType.Pinned]: 'bg-theme-bg-bun',
  [RaisedLabelType.Beta]: 'bg-cabbage-40',
};

type FlagProps = {
  type: RaisedLabelType;
  description?: string;
};
export function Flag({
  type = RaisedLabelType.Hot,
  description,
}: FlagProps): ReactElement {
  return (
    <div
      className={classNames(
        'absolute flex items-start',
        'bottom-full left-0 ml-5 h-5',
      )}
    >
      <SimpleTooltip content={description}>
        <div
          className={classNames(
            'flex items-center px-1',
            styles.flag,
            typeToClassName[type],
            'h-full flex-col rounded-t mouse:translate-y-4',
          )}
        >
          <span className="font-bold uppercase text-white typo-caption2">
            {type}
          </span>
        </div>
      </SimpleTooltip>
      {description && (
        <span className="ml-2 text-theme-label-tertiary typo-footnote mouse:hidden">
          {description}
        </span>
      )}
    </div>
  );
}
