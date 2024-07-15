import React, { ReactElement } from 'react';
import { ChecklistStepPropsWithSquad } from '../../lib/checklist';
import { ChecklistStep } from './ChecklistStep';
import { SquadPostsProgressBar } from '../squads/SquadPostsProgressBar';
import PublicSquadSubmissionActions from '../squads/PublicSquadSubmissionActions';

export const GoPublicStep = ({
  squad,
  ...props
}: ChecklistStepPropsWithSquad): ReactElement => {
  const postsCount = squad?.flags?.totalPosts ?? 0;

  return (
    <ChecklistStep {...props}>
      <div className="flex flex-col items-stretch gap-4">
        <SquadPostsProgressBar
          postsCount={postsCount}
          className={{
            progressBackground: 'bg-border-subtlest-tertiary',
            progressBar: '!bg-border-subtlest-primary',
            label: 'typo-caption2',
            labelHeader: 'text-text-primary',
            labelContent: 'font-normal',
            container: 'flex-col-reverse gap-2',
          }}
        />
        <PublicSquadSubmissionActions squad={squad} />
      </div>
    </ChecklistStep>
  );
};
