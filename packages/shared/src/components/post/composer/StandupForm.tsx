import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import RichTextInput from '../../fields/RichTextInput';
import styles from './StandupForm.module.css';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  dateFormatInTimezone,
  DEFAULT_TIMEZONE,
  getTimezoneOffsetLabel,
} from '../../../lib/timezones';
import {
  STANDUP_DESCRIPTION_MAX_LENGTH,
  STANDUP_TOPIC_MAX_LENGTH,
  type StandupFormState,
  type StandupScheduleChoice,
} from './types';

const DEFAULT_SCHEDULE_DELAY_MS = 30 * 60 * 1000;

const getDefaultScheduledStart = (timezone: string): string =>
  dateFormatInTimezone(
    new Date(Date.now() + DEFAULT_SCHEDULE_DELAY_MS),
    "yyyy-MM-dd'T'HH:mm",
    timezone,
  );

const formatScheduleDelta = (date: Date | null): string | null => {
  if (!date) {
    return null;
  }

  const diffMs = date.getTime() - Date.now();
  if (diffMs <= 0) {
    return 'starting now';
  }

  const minutes = Math.max(1, Math.round(diffMs / 60_000));
  if (minutes < 60) {
    return `in ${minutes} minute${minutes === 1 ? '' : 's'}`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `in ${hours} hour${hours === 1 ? '' : 's'}`;
  }

  const days = Math.round(hours / 24);
  return `in ${days} day${days === 1 ? '' : 's'}`;
};

const parseScheduledStartLocal = (value: string | undefined): Date | null => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

interface ScheduleToggleProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

const ScheduleToggle = ({
  active,
  onClick,
  children,
}: ScheduleToggleProps): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={classNames(
      'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-8 border px-3 transition-colors typo-caption1',
      active
        ? 'border-accent-cabbage-default bg-surface-float text-text-primary'
        : 'border-border-subtlest-tertiary bg-transparent text-text-tertiary hover:border-border-subtlest-secondary hover:bg-surface-float hover:text-text-primary',
    )}
  >
    {children}
  </button>
);

interface StandupFormProps {
  value: StandupFormState;
  onChange: (next: StandupFormState) => void;
  topicError?: string;
  scheduledStartError?: string;
  descriptionError?: string;
  toolbarLeading?: ReactNode;
  toolbarRightActions?: ReactNode;
}

export const StandupForm = ({
  value,
  onChange,
  topicError,
  scheduledStartError,
  toolbarLeading,
  toolbarRightActions,
}: StandupFormProps): ReactElement => {
  const { user } = useAuthContext();
  const topicRef = useRef<HTMLTextAreaElement>(null);
  const timezone = user?.timezone || DEFAULT_TIMEZONE;
  const timezoneLabel = getTimezoneOffsetLabel(timezone);
  const defaultScheduledStart = useMemo(
    () => getDefaultScheduledStart(timezone),
    [timezone],
  );

  useEffect(() => {
    topicRef.current?.focus();
  }, []);

  const isScheduled = value.scheduleChoice === 'later';
  const scheduledStartDate = parseScheduledStartLocal(value.scheduledStart);
  const scheduleDelta = isScheduled
    ? formatScheduleDelta(scheduledStartDate)
    : null;

  const handleSchedule = (next: StandupScheduleChoice) => {
    if (next === value.scheduleChoice) {
      return;
    }
    if (next === 'later' && !value.scheduledStart) {
      onChange({
        ...value,
        scheduleChoice: next,
        scheduledStart: defaultScheduledStart,
      });
      return;
    }
    onChange({ ...value, scheduleChoice: next });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-col gap-3 px-5 pb-3 pt-2">
        <textarea
          ref={topicRef}
          name="topic"
          placeholder="What do you want to talk about?"
          maxLength={STANDUP_TOPIC_MAX_LENGTH}
          rows={1}
          value={value.topic}
          onChange={(event) =>
            onChange({
              ...value,
              topic: event.currentTarget.value.replace(/\n/g, ''),
            })
          }
          aria-label="Standup topic"
          className={classNames(
            'w-full resize-none overflow-hidden break-words bg-transparent font-bold leading-tight text-text-primary outline-none typo-title2 placeholder:text-text-quaternary',
            topicError && 'text-status-error',
          )}
        />
        <div className="flex flex-wrap items-center gap-2">
          <ScheduleToggle
            active={!isScheduled}
            onClick={() => handleSchedule('now')}
          >
            Start now
          </ScheduleToggle>
          <ScheduleToggle
            active={isScheduled}
            onClick={() => handleSchedule('later')}
          >
            Schedule for later
          </ScheduleToggle>
          <span className="text-text-tertiary typo-caption1">
            {isScheduled
              ? "We'll open a lobby so people can RSVP."
              : "You'll click Go live before listeners can join."}
          </span>
        </div>
        {isScheduled && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="standup-scheduled-start"
              name="scheduledStart"
              type="datetime-local"
              value={value.scheduledStart}
              onChange={(event) =>
                onChange({
                  ...value,
                  scheduledStart: event.currentTarget.value,
                })
              }
              aria-label="Scheduled time"
              className={classNames(
                styles.scheduledTimeInput,
                'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-8 border bg-surface-float px-3 text-text-primary outline-none typo-caption1',
                scheduledStartError
                  ? 'border-status-error'
                  : 'border-border-subtlest-tertiary',
              )}
            />
            <span className="text-text-tertiary typo-caption1">
              {scheduledStartError ??
                [scheduleDelta, timezoneLabel].filter(Boolean).join(' · ')}
            </span>
          </div>
        )}
      </div>
      <RichTextInput
        initialContent={value.description}
        onValueUpdate={(next) => onChange({ ...value, description: next })}
        textareaProps={{
          name: 'description',
          placeholder: 'Add context for the lobby and Agenda tab (optional)',
        }}
        enabledCommand={{
          upload: true,
          link: true,
          mention: true,
          emoji: true,
          gif: true,
        }}
        maxInputLength={STANDUP_DESCRIPTION_MAX_LENGTH}
        allowBlockFormatting
        minHeightClassName="min-h-[8rem]"
        toolbarPosition="bottom"
        toolbarLeading={toolbarLeading}
        toolbarRightActions={toolbarRightActions}
        hideMarkdownToggle
        hideMarkdownHeader
        hideFooter
        className={{
          container: '!min-h-0 !flex-1 !rounded-none !bg-transparent',
          input: '!px-5',
        }}
      />
    </div>
  );
};
