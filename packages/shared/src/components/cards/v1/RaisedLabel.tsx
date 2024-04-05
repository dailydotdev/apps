import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { SimpleTooltip } from '../../tooltips/SimpleTooltip';
import { IconSize } from '../../Icon';
import { TrendingIcon } from '../../icons';

export enum RaisedLabelType {
  HotV1 = 'HotV1',
  Hot = 'Hot',
  Pinned = 'Pinned',
  Beta = 'Beta',
}

const typeToClassName: Record<RaisedLabelType, string> = {
  [RaisedLabelType.HotV1]: 'bg-action-downvote-default',
  [RaisedLabelType.Hot]: 'bg-status-error',
  [RaisedLabelType.Pinned]: 'bg-status-warning',
  [RaisedLabelType.Beta]: 'bg-theme-bg-cabbage',
};

const typeToContent: Partial<Record<RaisedLabelType, ReactElement>> = {
  [RaisedLabelType.HotV1]: (
    <>
      Trending <TrendingIcon secondary className="ml-1 !size-4" />
    </>
  ),
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
        'absolute right-3 flex flex-row group-hover:bg-background-subtle group-focus:-top-0.5 group-focus:bg-background-subtle',
        !focus && '-top-px bg-background-default',
        focus && '-top-0.5 bg-background-subtle',
        className,
      )}
    >
      <SimpleTooltip content={description}>
        <div
          className={classNames(
            'relative -top-2 flex h-4 rounded-4 px-2 font-bold uppercase text-white typo-caption2',
            typeToClassName[type],
          )}
        >
          {typeToContent[type] ?? type}
        </div>
      </SimpleTooltip>
    </div>
  );
}
