import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { MiniCloseIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { LogEvent, TargetType } from '../../lib/log';

interface ReadingReminderHeroProps {
  className?: string;
  onEnable: () => void | Promise<void>;
  onDismiss: () => void;
}

const ReadingReminderHero = ({
  className,
  onEnable,
  onDismiss,
}: ReadingReminderHeroProps): ReactElement => {
  useLogEventOnce(() => ({
    event_name: LogEvent.Impression,
    target_type: TargetType.ReadingReminder,
  }));

  return (
    <div
      className={classNames(
        'absolute z-modal flex w-full overflow-hidden px-4 pb-2',
        className,
      )}
    >
      <div className="relative flex w-full flex-col rounded-16 border border-border-subtlest-secondary bg-surface-float px-4 py-3">
        <Button
          className="absolute right-2 top-2"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          icon={<MiniCloseIcon />}
          aria-label="Dismiss reading reminder"
          onClick={onDismiss}
        />
        <div className="pr-8">
          <Typography tag={TypographyTag.P} type={TypographyType.Title3}>
            Never miss a learning day
          </Typography>
          <Typography
            className="mt-1"
            tag={TypographyTag.P}
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Turn on your daily reading reminder for 9:00 and keep your routine.
          </Typography>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <Typography tag={TypographyTag.P} type={TypographyType.LargeTitle}>
            {'\u23f0'}
          </Typography>
          <Button
            className="flex-1"
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
