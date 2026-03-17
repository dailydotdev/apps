import type { ReactElement } from 'react';
import React from 'react';
import { BellIcon } from '../../icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';

type EnableNotificationsCtaProps = {
  onEnable: () => void | Promise<void>;
  message?: string;
};

const EnableNotificationsCta = ({
  onEnable,
  message = 'Get notified about new posts',
}: EnableNotificationsCtaProps): ReactElement => {
  return (
    <div className="flex w-full items-center gap-2 rounded-8 bg-surface-float px-3 py-2">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="flex-1"
      >
        {message}
      </Typography>
      <Button
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        icon={
          <BellIcon className="origin-top motion-safe:[animation:enable-notification-bell-ring_1.1s_ease-in-out_infinite]" />
        }
        onClick={onEnable}
      >
        Enable
      </Button>
      <style>
        {`
          @keyframes enable-notification-bell-ring {
            0%, 100% { transform: rotate(0deg); }
            20% { transform: rotate(-16deg); }
            40% { transform: rotate(14deg); }
            60% { transform: rotate(-10deg); }
            80% { transform: rotate(8deg); }
          }
        `}
      </style>
    </div>
  );
};

export default EnableNotificationsCta;
