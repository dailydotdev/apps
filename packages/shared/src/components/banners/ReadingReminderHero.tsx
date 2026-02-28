import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonVariant } from '../buttons/Button';
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
}

const ReadingReminderHero = ({
  className,
  onEnable,
}: ReadingReminderHeroProps): ReactElement => {
  useLogEventOnce(() => ({
    event_name: LogEvent.Impression,
    target_type: TargetType.ReadingReminder,
  }));

  return (
    <div className={classNames('flex w-full', className)}>
      <div className="flex w-full flex-col rounded-16 border border-border-subtlest-secondary bg-surface-float px-4 py-3">
        <Typography type={TypographyType.Title3}>
          Never miss a learning day
        </Typography>
        <Typography
          className="mt-1"
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Turn on your daily reading reminder and keep your routine.
        </Typography>
        <div className="mt-3">
          <Button
            className="w-full"
            variant={ButtonVariant.Primary}
            onClick={onEnable}
          >
            Enable reminder
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReadingReminderHero;
