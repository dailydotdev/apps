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
        'left-0 bottom-full ml-5 h-5',
      )}
    >
      <SimpleTooltip content={description}>
        <div
          className={classNames(
            'flex items-center px-1',
            styles.flag,
            typeToClassName[type],
            'h-full flex-col mouse:translate-y-4 rounded-t',
          )}
        >
          <span className="font-bold text-white uppercase typo-caption2">
            {type}
          </span>
        </div>
      </SimpleTooltip>
      {description && (
        <span className="mouse:hidden ml-2 typo-footnote text-theme-label-tertiary">
          {description}
        </span>
      )}
    </div>
  );
}
