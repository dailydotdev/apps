import React, { ReactElement } from 'react';

import { ChecklistStepPropsWithSquad } from '../../lib/checklist';
import { webappUrl } from '../../lib/constants';
import { Button, ButtonVariant } from '../buttons/Button';
import { EditIcon } from '../icons';
import { ChecklistStep } from './ChecklistStep';

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
