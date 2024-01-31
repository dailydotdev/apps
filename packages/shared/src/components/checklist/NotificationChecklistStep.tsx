import React, { ReactElement } from 'react';
import { ChecklistStepProps } from '../../lib/checklist';
import { Button, ButtonVariant } from '../buttons/ButtonV2';
import { ChecklistStep } from './ChecklistStep';
import { BellIcon } from '../icons';
import { NotificationPromptSource } from '../../lib/analytics';
import { useEnableNotification } from '../../hooks/useEnableNotification';

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
