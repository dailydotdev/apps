import React, { ReactElement } from 'react';
import { ChecklistStepProps } from '../../lib/checklist';
import { Button } from '../buttons/Button';
import { ChecklistStep } from './ChecklistStep';
import BellIcon from '../icons/Bell';
import { NotificationPromptSource } from '../../lib/analytics';
import { useEnableNotification } from '../../hooks/useEnableNotification';

const NotificationChecklistStep = (props: ChecklistStepProps): ReactElement => {
  const { onEnable } = useEnableNotification({
    source: NotificationPromptSource.SquadChecklist,
  });

  return (
    <ChecklistStep {...props}>
      <Button icon={<BellIcon />} className="btn-primary" onClick={onEnable}>
        Subscribe
      </Button>
    </ChecklistStep>
  );
};

export { NotificationChecklistStep };
