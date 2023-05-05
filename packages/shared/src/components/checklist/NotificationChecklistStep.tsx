import React, { ReactElement } from 'react';
import { ChecklistStepProps } from '../../lib/checklist';
import { Button } from '../buttons/Button';
import { ChecklistStep } from './ChecklistStep';
import BellIcon from '../icons/Bell';

const NotificationChecklistStep = (props: ChecklistStepProps): ReactElement => {
  // TODO WT-1293-checklist-components add business logic

  return (
    <ChecklistStep {...props}>
      <Button icon={<BellIcon />} className="btn-primary">
        Subscribe
      </Button>
    </ChecklistStep>
  );
};

export { NotificationChecklistStep };
