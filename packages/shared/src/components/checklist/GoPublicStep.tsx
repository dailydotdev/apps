import React, { ReactElement } from 'react';
import { ChecklistStepPropsWithSquad } from '../../lib/checklist';
import { ChecklistStep } from './ChecklistStep';
import PublicSquadSubmissionActions from '../squads/PublicSquadSubmissionActions';
import { SquadPublicProgressBars } from '../squads/SquadPublicProgressBars';
import { Button } from '../buttons/Button';
import { ActionType } from '../../graphql/actions';
import { useActions } from '../../hooks';

export const GoPublicStep = ({
  squad,
  ...props
}: ChecklistStepPropsWithSquad): ReactElement => {
  const postsCount = squad?.flags?.totalPosts ?? 0;

  const { completeAction } = useActions();

  const onDismiss = () => {
    completeAction(ActionType.HidePublicSquadStep);
  };

  return (
    <ChecklistStep {...props}>
      <div className="flex flex-col items-stretch gap-4">
        <SquadPublicProgressBars postsCount={postsCount} />
        <div className="flex flex-row gap-2">
          {!squad.public && (
            <>
              <PublicSquadSubmissionActions
                squad={squad}
                isDetailsVisible={false}
              />
              <Button onClick={onDismiss}>Dismiss</Button>
            </>
          )}
        </div>
      </div>
    </ChecklistStep>
  );
};
