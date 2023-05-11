import React, { ReactElement } from 'react';
import { ChecklistStepProps } from '../../lib/checklist';
import { Button } from '../buttons/Button';
import { ChecklistStep } from './ChecklistStep';
import EditIcon from '../icons/Edit';

const SquadEditWelcomePostChecklistStep = (
  props: ChecklistStepProps,
): ReactElement => {
  // TODO WT-1293-checklist-components add business logic

  return (
    <ChecklistStep {...props}>
      <Button className="btn-primary" icon={<EditIcon />}>
        Customize
      </Button>
    </ChecklistStep>
  );
};

export { SquadEditWelcomePostChecklistStep };
