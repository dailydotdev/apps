import React, { ReactElement } from 'react';

import { SquadAdminReputationProgressBar } from './SquadAdminReputationProgressBar';
import { SquadPostsProgressBar } from './SquadPostsProgressBar';

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
