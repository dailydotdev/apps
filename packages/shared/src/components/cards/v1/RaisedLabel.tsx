import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { SimpleTooltip } from '../../tooltips/SimpleTooltip';
import classed from '../../../lib/classed';

export enum RaisedLabelType {
  Hot = 'Hot',
  Pinned = 'Pinned',
  Beta = 'Beta',
}

const typeToClassName: Record<RaisedLabelType, string> = {
  [RaisedLabelType.Hot]: 'bg-theme-status-error',
  [RaisedLabelType.Pinned]: 'bg-theme-bg-bun',
  [RaisedLabelType.Beta]: 'bg-theme-bg-cabbage',
};

export interface RaisedLabelProps {
  type: RaisedLabelType;
  description?: string;
  className?: string | undefined;
}

export function RaisedLabel({
  type = RaisedLabelType.Hot,
  description,
  className,
}: RaisedLabelProps): ReactElement {
  return (
    <div
      className={classNames(
        'absolute -top-[1px] right-2 flex flex-row px-2 bg-theme-bg-primary group-hover:bg-theme-bg-secondary group-focus:bg-theme-bg-secondary group-focus:-top-0.5',
        className,
      )}
    >
      <SimpleTooltip content={description}>
        <div
          className={classNames(
            'relative -top-2 h-4 rounded-sm px-2 font-bold uppercase text-white typo-caption2',
            typeToClassName[type],
          )}
        >
          {type}
        </div>
      </SimpleTooltip>
    </div>
  );
}
