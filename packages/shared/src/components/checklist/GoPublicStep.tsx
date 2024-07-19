import React, { ReactElement } from 'react';
import { ChecklistStepPropsWithSquad } from '../../lib/checklist';
import { ChecklistStep } from './ChecklistStep';
import PublicSquadSubmissionActions from '../squads/PublicSquadSubmissionActions';
import { SquadPublicProgressBars } from '../squads/SquadPublicProgressBars';

export const GoPublicStep = ({
  squad,
  ...props
}: ChecklistStepPropsWithSquad): ReactElement => {
  const postsCount = squad?.flags?.totalPosts ?? 0;

  return (
    <ChecklistStep {...props}>
      <div className="flex flex-col items-stretch gap-4">
        <SquadPublicProgressBars postsCount={postsCount} />
        <PublicSquadSubmissionActions squad={squad} />
      </div>
    </ChecklistStep>
  );
};
