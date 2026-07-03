import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import { PopoverContent } from '../../popover/Popover';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { CalendarIcon, MiniCloseIcon } from '../../icons';
import { Tooltip } from '../../tooltip/Tooltip';
import { TextField } from '../../fields/TextField';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import Link from '../../utilities/Link';
import { Drawer, DrawerPosition } from '../../drawers/Drawer';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import { getTimezoneNameWithOffset } from '../../../lib/timezones';
import { timezoneSettingsUrl } from '../../../lib/constants';
import {
  formatScheduleDelta,
  parsePostScheduledStart,
} from '../../../lib/scheduledPost';
import styles from '../../fields/dateTimeInput.module.css';

interface SchedulePostButtonProps {
  isScheduled: boolean;
  scheduledStart: string;
  timezone: string;
  error?: string | null;
  disabled?: boolean;
  onScheduledStartChange: (value: string) => void;
  onSeedDefault: () => void;
  onConfirm: () => boolean;
  onClear: () => void;
}

export function SchedulePostButton({
  isScheduled,
  scheduledStart,
  timezone,
  error,
  disabled,
  onScheduledStartChange,
  onSeedDefault,
  onConfirm,
  onClear,
}: SchedulePostButtonProps): ReactElement {
  const [open, setOpen] = useState(false);
  const isTablet = useViewSize(ViewSize.Tablet);
  const scheduledDate = parsePostScheduledStart(scheduledStart, timezone);
  const delta = formatScheduleDelta(scheduledDate);
  const timezoneLabel = getTimezoneNameWithOffset(timezone);
  const tooltipContent =
    isScheduled && delta ? `Scheduled ${delta}` : 'Schedule post';

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      onSeedDefault();
    }
  };

  const pickerBody = (
    <>
      <div className="flex flex-col gap-1.5">
        <TextField
          inputId="post-scheduled-start"
          name="post-scheduled-start"
          // Required by TextField, but rendered as a tertiary field so the
          // (redundant) floating label isn't shown next to the popover title.
          label="Scheduled time"
          fieldType="tertiary"
          aria-label="Scheduled time"
          type="datetime-local"
          value={scheduledStart}
          onChange={(event) =>
            onScheduledStartChange(event.currentTarget.value)
          }
          valid={!error}
          className={{ input: styles.dateTimeInput }}
        />
        {error ? (
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.StatusError}
          >
            {error}
          </Typography>
        ) : (
          <div className="flex flex-col gap-0.5">
            {delta && (
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {delta}
              </Typography>
            )}
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              {`${timezoneLabel} · `}
              <Link href={timezoneSettingsUrl} passHref>
                <a className="text-text-link">Change timezone</a>
              </Link>
            </Typography>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        {isScheduled ? (
          <Button
            type="button"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            onClick={() => {
              onClear();
              setOpen(false);
            }}
          >
            Publish now
          </Button>
        ) : (
          <span />
        )}
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={() => {
            if (onConfirm()) {
              setOpen(false);
            }
          }}
        >
          {isScheduled ? 'Update schedule' : 'Schedule'}
        </Button>
      </div>
    </>
  );

  if (!isTablet) {
    return (
      <>
        <Tooltip content={tooltipContent}>
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<CalendarIcon secondary={isScheduled} />}
            pressed={isScheduled}
            disabled={disabled}
            aria-label="Schedule post"
            onClick={() => onOpenChange(true)}
          />
        </Tooltip>
        <Drawer
          isOpen={open}
          onClose={() => setOpen(false)}
          position={DrawerPosition.Bottom}
          className={{ wrapper: 'flex flex-col gap-3 p-4' }}
        >
          <div className="flex shrink-0 items-center justify-between">
            <Typography type={TypographyType.Title3} bold>
              Schedule post
            </Typography>
            <Button
              type="button"
              icon={<MiniCloseIcon />}
              onClick={() => setOpen(false)}
              aria-label="Close"
            />
          </div>
          {pickerBody}
        </Drawer>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Tooltip content={tooltipContent}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<CalendarIcon secondary={isScheduled} />}
            pressed={isScheduled}
            disabled={disabled}
            aria-label="Schedule post"
          />
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent
        side="top"
        align="end"
        avoidCollisions
        className="flex w-80 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4 shadow-2 data-[side=bottom]:mt-1 data-[side=top]:mb-1"
      >
        <Typography type={TypographyType.Body} bold>
          Schedule post
        </Typography>
        {pickerBody}
      </PopoverContent>
    </Popover>
  );
}
