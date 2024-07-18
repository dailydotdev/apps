import React, { ReactElement } from 'react';
import { SquadPostsProgressBar } from './SquadPostsProgressBar';
import { SquadAdminReputationProgressBar } from './SquadAdminReputationProgressBar';

interface Props {
  postsCount: number;
}
export const SquadPublicProgressBars = ({
  postsCount,
}: Props): ReactElement => {
  return (
    <div className="flex w-full flex-col gap-4">
      <SquadPostsProgressBar postsCount={postsCount} />
      <SquadAdminReputationProgressBar />
    </div>
  );
};
