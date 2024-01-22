import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { SimpleTooltip } from '../../tooltips/SimpleTooltip';

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
  focus?: boolean;
}

export function RaisedLabel({
  type = RaisedLabelType.Hot,
  description,
  className,
  focus = false,
}: RaisedLabelProps): ReactElement {
  return (
    <div
      className={classNames(
        'absolute right-3 flex flex-row group-hover:bg-theme-bg-secondary group-focus:-top-0.5 group-focus:bg-theme-bg-secondary',
        !focus && '-top-px bg-theme-bg-primary',
        focus && '-top-0.5 bg-theme-bg-secondary',
        className,
      )}
    >
      <SimpleTooltip content={description}>
        <div
          className={classNames(
            'relative -top-2 h-4 rounded px-2 font-bold uppercase text-white typo-caption2',
            typeToClassName[type],
          )}
        >
          {type}
        </div>
      </SimpleTooltip>
    </div>
  );
}
