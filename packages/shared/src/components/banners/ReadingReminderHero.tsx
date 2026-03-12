import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonVariant } from '../buttons/Button';
import CloseButton from '../CloseButton';
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
      <div className="relative flex w-full flex-col rounded-16 border border-border-subtlest-secondary bg-surface-float px-4 py-3">
        {shouldShowDismiss && (
          <CloseButton
            className="absolute right-1 top-1 laptop:right-3 laptop:top-3"
            onClick={onDismiss}
          />
        )}
        <Typography type={TypographyType.Title3}>{title}</Typography>
        <Typography
          className="mt-1 pr-8 laptop:pr-0"
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
      </div>
    </div>
  );
};

export default ReadingReminderHero;
