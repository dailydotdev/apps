import React, { ReactElement } from 'react';

import { useEnableNotification } from '../../hooks/notifications';
import { ChecklistStepProps } from '../../lib/checklist';
import { NotificationPromptSource } from '../../lib/log';
import { Button, ButtonVariant } from '../buttons/Button';
import { BellIcon } from '../icons';
import { ChecklistStep } from './ChecklistStep';

const NotificationChecklistStep = (props: ChecklistStepProps): ReactElement => {
  const { onEnable } = useEnableNotification({
    source: NotificationPromptSource.SquadChecklist,
  });

  return (
    <ChecklistStep {...props}>
      <Button
        icon={<BellIcon />}
        variant={ButtonVariant.Primary}
        onClick={onEnable}
      >
        Subscribe
      </Button>
    </ChecklistStep>
  );
};

export { NotificationChecklistStep };
