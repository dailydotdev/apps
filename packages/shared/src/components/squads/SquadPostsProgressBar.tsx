import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ProgressBar } from '../fields/ProgressBar';

export const MIN_SQUAD_POSTS = 3;

interface ClassName {
  container?: string;
  label?: string;
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
  goal = MIN_SQUAD_POSTS,
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
        <span className="text-text-secondary">Posts</span>
        <span className="font-bold">
          {effectivePostsCount} / {goal}
        </span>
      </div>
      <div
        className={classNames(
          'h-2.5 rounded-10',
          className?.progressBackground ?? 'bg-background-subtle',
        )}
      >
        <ProgressBar
          percentage={Math.ceil((effectivePostsCount / goal) * 100)}
          className={classNames(
            '!static h-2.5 rounded-10 align-top',
            className?.progressBar,
          )}
        />
      </div>
    </div>
  );
};
