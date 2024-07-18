import React, { ReactElement } from 'react';
import { ProgressBar } from '../fields/ProgressBar';
import { PUBLIC_SQUAD_REQUEST_REQUIREMENT } from '../../lib/config';

interface Props {
  postsCount: number;
}

const GOAL = PUBLIC_SQUAD_REQUEST_REQUIREMENT;

export const SquadPostsProgressBar = ({
  postsCount = 0,
}: Props): ReactElement => {
  const effectivePostsCount = Math.min(postsCount, GOAL);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between typo-footnote">
        <span className="text-text-secondary">Posts</span>
        <span className="font-bold">
          {effectivePostsCount}/{GOAL}
        </span>
      </div>
      <ProgressBar
        shouldShowBg
        percentage={Math.ceil((effectivePostsCount / GOAL) * 100)}
        className={{
          bar: 'static left-1 h-2.5 rounded-10 align-top',
          wrapper: 'rounded-10 bg-background-subtle',
        }}
      />
    </div>
  );
};
