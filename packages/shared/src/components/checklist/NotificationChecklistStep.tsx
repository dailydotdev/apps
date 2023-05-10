import React, { ReactElement, useContext } from 'react';
import { ChecklistStepProps } from '../../lib/checklist';
import { Button } from '../buttons/Button';
import { ChecklistStep } from './ChecklistStep';
import BellIcon from '../icons/Bell';
import NotificationsContext from '../../contexts/NotificationsContext';
import { NotificationPromptSource } from '../../lib/analytics';

const NotificationChecklistStep = (props: ChecklistStepProps): ReactElement => {
  const { onTogglePermission } = useContext(NotificationsContext);

  return (
    <ChecklistStep {...props}>
      <Button
        icon={<BellIcon />}
        className="btn-primary"
        onClick={() => {
          onTogglePermission(NotificationPromptSource.SquadChecklist);
        }}
      >
        Subscribe
      </Button>
    </ChecklistStep>
  );
};

export { NotificationChecklistStep };
