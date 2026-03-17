import type { ReactElement } from 'react';
import React from 'react';
import { BellIcon } from '../icons';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

type StreakNotificationReminderProps = {
  onEnable: () => void | Promise<void>;
};

export const StreakNotificationReminder = ({
  onEnable,
}: StreakNotificationReminderProps): ReactElement => {
  return (
    <div className="mt-3 flex w-full items-center gap-2 border-t border-border-subtlest-tertiary px-3 pb-2 pt-3">
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="flex-1"
      >
        Never lose your streak again.
      </Typography>
      <Button
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Bacon}
        icon={
          <BellIcon className="origin-top motion-safe:[animation:enable-notification-bell-ring_1.1s_ease-in-out_infinite]" />
        }
        onClick={onEnable}
      >
        Enable
      </Button>
    </div>
  );
};
