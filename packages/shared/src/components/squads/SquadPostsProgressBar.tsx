import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ProgressBar } from '../fields/ProgressBar';
import { PUBLIC_SQUAD_REQUEST_REQUIREMENT } from '../../lib/config';

interface ClassName {
  container?: string;
  label?: string;
  labelHeader?: string;
  labelContent?: string;
  progressBar?: string;
  progressBackground?: string;
}

interface Props {
  className?: ClassName;
  goal?: number;
  postsCount: number;
}

export const SquadPostsProgressBar = ({
  className,
  goal = PUBLIC_SQUAD_REQUEST_REQUIREMENT,
  postsCount = 0,
}: Props): ReactElement => {
  const effectivePostsCount = Math.min(postsCount, goal);

  return (
    <div className={classNames('flex flex-col gap-1.5', className?.container)}>
      <div
        className={classNames(
          'flex items-center justify-between typo-footnote',
          className?.label,
        )}
      >
        <span
          className={classNames(
            className?.labelHeader ?? 'text-text-secondary',
          )}
        >
          Posts
        </span>
        <span className={classNames(className?.labelContent ?? 'font-bold')}>
          {effectivePostsCount}/{goal}
        </span>
      </div>
      <ProgressBar
        percentage={Math.ceil((effectivePostsCount / goal) * 100)}
        className={{
          bar: classNames(
            'static left-1 h-2.5 rounded-10 align-top',
            className?.progressBar,
          ),
          wrapper: classNames(
            'rounded-10',
            className?.progressBackground ?? 'bg-background-subtle',
          ),
        }}
      />
    </div>
  );
};
