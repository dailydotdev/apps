import React, { ReactElement } from 'react';
import { ChecklistStepPropsWithSquad } from '../../lib/checklist';
import { Button, ButtonVariant } from '../buttons/Button';
import { ChecklistStep } from './ChecklistStep';
import { EditIcon } from '../icons';
import { webappUrl } from '../../lib/constants';

export const EditSquadStep = ({
  squad,
  ...props
}: ChecklistStepPropsWithSquad): ReactElement => {
  return (
    <ChecklistStep {...props}>
      <div className="flex">
        <Button
          tag="a"
          variant={ButtonVariant.Primary}
          icon={<EditIcon />}
          href={`${webappUrl}squads/${squad.handle}/edit`}
        >
          Edit Squad
        </Button>
      </div>
    </ChecklistStep>
  );
};
