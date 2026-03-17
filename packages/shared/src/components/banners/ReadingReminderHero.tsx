import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonVariant } from '../buttons/Button';
import { BellIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { LogEvent, TargetType } from '../../lib/log';

interface ReadingReminderHeroProps {
  className?: string;
  onEnable: () => Promise<void>;
  onClose?: () => void;
}

const ReadingReminderHero = ({
  className,
  onEnable,
  onClose,
}: ReadingReminderHeroProps): ReactElement => {
  useLogEventOnce(() => ({
    event_name: LogEvent.Impression,
    target_type: TargetType.ReadingReminder,
  }));

  return (
    <div className={classNames('flex w-full flex-col', className)}>
      <Typography type={TypographyType.Title3} bold>
        Never miss a learning day
      </Typography>
      <Typography
        className="mt-1"
        type={TypographyType.Body}
        color={TypographyColor.Tertiary}
      >
        Turn on your daily reading reminder and keep your routine.
      </Typography>
      <div className="mt-3">
        <Button
          className="w-full"
          variant={ButtonVariant.Primary}
          icon={
            <BellIcon className="origin-top motion-safe:[animation:enable-notification-bell-ring_1.1s_ease-in-out_infinite]" />
          }
          onClick={onEnable}
        >
          Enable reminder
        </Button>
        {onClose && (
          <Button
            className="mt-2 w-full"
            variant={ButtonVariant.Tertiary}
            onClick={onClose}
          >
            Close
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReadingReminderHero;
