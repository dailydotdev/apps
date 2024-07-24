import React, { ReactElement } from 'react';
import { ChecklistStepPropsWithSquad } from '../../lib/checklist';
import { ChecklistStep } from './ChecklistStep';
import PublicSquadSubmissionActions from '../squads/PublicSquadSubmissionActions';
import { SquadPublicProgressBars } from '../squads/SquadPublicProgressBars';
import { Button } from '../buttons/Button';
import { useSquadChecklist } from '../../hooks/useSquadChecklist';
import { ActionType } from '../../graphql/actions';

export const GoPublicStep = ({
  squad,
  ...props
}: ChecklistStepPropsWithSquad): ReactElement => {
  const postsCount = squad?.flags?.totalPosts ?? 0;
  const { onToggleStep } = useSquadChecklist({ squad });

  const onDismiss = () => {
    onToggleStep({
      type: ActionType.HidePublicSquadStep,
      completedAt: new Date(),
    });
  };

  return (
    <ChecklistStep {...props}>
      <div className="flex flex-col items-stretch gap-4">
        <SquadPublicProgressBars postsCount={postsCount} />
        <div className="flex flex-row gap-2">
          <PublicSquadSubmissionActions
            squad={squad}
            isDetailsVisible={false}
          />
          <Button onClick={onDismiss}>Dismiss</Button>
        </div>
      </div>
    </ChecklistStep>
  );
};
