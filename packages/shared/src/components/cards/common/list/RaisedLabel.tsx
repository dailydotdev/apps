import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Tooltip } from '../../../tooltip/Tooltip';
import ConditionalWrapper from '../../../ConditionalWrapper';

export enum RaisedLabelType {
  Hot = 'Hot',
  Pinned = 'Pinned',
  Beta = 'Beta',
}

const typeToClassName: Record<RaisedLabelType, string> = {
  [RaisedLabelType.Hot]: 'bg-status-error',
  [RaisedLabelType.Pinned]: 'bg-status-warning',
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
