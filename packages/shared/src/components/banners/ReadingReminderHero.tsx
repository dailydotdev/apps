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
  title: string;
  subtitle: string;
  shouldShowDismiss?: boolean;
  onEnable: () => Promise<void>;
  onDismiss: () => Promise<void>;
}

const ReadingReminderHero = ({
  className,
  title,
  subtitle,
  shouldShowDismiss = false,
  onEnable,
  onDismiss,
}: ReadingReminderHeroProps): ReactElement => {
  useLogEventOnce(() => ({
    event_name: LogEvent.Impression,
    target_type: TargetType.ReadingReminder,
  }));

  return (
    <div className={classNames('flex w-full', className)}>
      <div className="flex w-full flex-col rounded-16 border border-border-subtlest-secondary bg-surface-float px-4 py-3">
        <Typography type={TypographyType.Title3}>{title}</Typography>
        <Typography
          className="mt-1"
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {subtitle}
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
        {shouldShowDismiss && (
          <div className="mt-2">
            <Button
              className="w-full"
              variant={ButtonVariant.Tertiary}
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingReminderHero;
