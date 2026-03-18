import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { BellIcon } from '../../icons';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { NotificationCtaKind } from '../../../lib/log';
import type {
  NotificationCtaPlacement,
  NotificationPromptSource,
} from '../../../lib/log';
import {
  useNotificationCtaAnalytics,
  useNotificationCtaImpression,
} from '../../../hooks/notifications/useNotificationCtaAnalytics';

type EnableNotificationsCtaProps = {
  onEnable: () => void | Promise<void>;
  message?: string;
  analytics: {
    placement: NotificationCtaPlacement;
    targetType: string;
    source?: NotificationPromptSource;
    targetId?: string;
  };
};

const EnableNotificationsCta = ({
  onEnable,
  message = 'Get notified about new posts',
  analytics,
}: EnableNotificationsCtaProps): ReactElement => {
  const { logClick } = useNotificationCtaAnalytics();

  useNotificationCtaImpression({
    kind: NotificationCtaKind.FollowUpCta,
    ...analytics,
  });

  const onEnableClick = useCallback(async () => {
    logClick({
      kind: NotificationCtaKind.FollowUpCta,
      ...analytics,
    });
    await onEnable();
  }, [analytics, logClick, onEnable]);

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
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        icon={
          <BellIcon className="origin-top motion-safe:[animation:enable-notification-bell-ring_1.1s_ease-in-out_infinite]" />
        }
        onClick={onEnableClick}
      >
        Enable
      </Button>
    </div>
  );
};

export default EnableNotificationsCta;
