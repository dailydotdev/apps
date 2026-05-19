import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { Radio } from '../../fields/Radio';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { TextField } from '../../fields/TextField';
import RichTextInput from '../../fields/RichTextInput';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  dateFormatInTimezone,
  DEFAULT_TIMEZONE,
  getTimezoneOffsetLabel,
} from '../../../lib/timezones';
import { timezoneSettingsUrl } from '../../../lib/constants';
import Link from '../../utilities/Link';
import styles from '../../liveRooms/CreateLiveRoomForm.module.css';
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
    return 'now';
  }

  const minutes = Math.max(1, Math.round(diffMs / 60_000));
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} from now`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} from now`;
  }

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} from now`;
};

const parseScheduledStartLocal = (value: string | undefined): Date | null => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

interface StandupFormProps {
  value: StandupFormState;
  onChange: (next: StandupFormState) => void;
  topicError?: string;
  scheduledStartError?: string;
  descriptionError?: string;
}

export const StandupForm = ({
  value,
  onChange,
  topicError,
  scheduledStartError,
  descriptionError,
}: StandupFormProps): ReactElement => {
  const { user } = useAuthContext();
  const [topicInput, setTopicInput] = useState<HTMLInputElement | null>(null);
  const timezone = user?.timezone || DEFAULT_TIMEZONE;
  const timezoneLabel = getTimezoneOffsetLabel(timezone);
  const defaultScheduledStart = useMemo(
    () => getDefaultScheduledStart(timezone),
    [timezone],
  );

  useEffect(() => {
    topicInput?.focus();
  }, [topicInput]);

  const isScheduled = value.scheduleChoice === 'later';
  const scheduledStartDate = parseScheduledStartLocal(value.scheduledStart);
  const scheduleDelta = isScheduled
    ? formatScheduleDelta(scheduledStartDate)
    : null;
  const topicCounter = STANDUP_TOPIC_MAX_LENGTH - value.topic.length;

  const handleScheduleChange = (next: StandupScheduleChoice) => {
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
    <div className="flex flex-col gap-5">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Standups are short, host-led audio and video rooms on daily.dev. Pick a
        topic, optionally schedule it, and go live when you&apos;re ready.
        Standups don&apos;t start automatically.
      </Typography>
      <div className="flex flex-col gap-1">
        <TextField
          inputId="standup-topic"
          inputRef={setTopicInput}
          name="topic"
          label="Topic"
          placeholder="What do you want to talk about?"
          maxLength={STANDUP_TOPIC_MAX_LENGTH}
          showMaxLength={false}
          value={value.topic}
          valueChanged={(next) => onChange({ ...value, topic: next })}
          valid={!topicError}
        />
        <div className="flex items-center justify-between gap-2">
          <Typography
            type={TypographyType.Caption1}
            color={
              topicError
                ? TypographyColor.StatusError
                : TypographyColor.Tertiary
            }
            className="min-w-0 flex-1"
          >
            {topicError ??
              'Keep it short and specific. Examples: “AMA: shipping a side project in 24h”, “Live code review: Next.js refactor”.'}
          </Typography>
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
            className="shrink-0 tabular-nums"
          >
            {topicCounter}
          </Typography>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Typography type={TypographyType.Footnote} bold>
          When do you want to start?
        </Typography>
        <Radio<StandupScheduleChoice>
          name="scheduleChoice"
          value={value.scheduleChoice}
          onChange={handleScheduleChange}
          options={[
            {
              value: 'now',
              label: 'Start now',
              className: { wrapper: 'gap-0' },
              afterElement: (
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                  className="-mt-1 pl-10"
                >
                  Open the room immediately. You&apos;ll still need to click
                  &quot;Go live&quot; before listeners can join.
                </Typography>
              ),
            },
            {
              value: 'later',
              label: 'Schedule for later',
              className: { wrapper: 'gap-0' },
              afterElement: (
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                  className="-mt-1 pl-10"
                >
                  Open a lobby where people can RSVP, chat, and get notified
                  when you go live.
                </Typography>
              ),
            },
          ]}
        />
      </div>
      {isScheduled ? (
        <div className="flex flex-col gap-1">
          <TextField
            inputId="standup-scheduled-start"
            name="scheduledStart"
            label="Scheduled time"
            aria-label="Scheduled time"
            type="datetime-local"
            value={value.scheduledStart}
            valueChanged={(next) =>
              onChange({ ...value, scheduledStart: next })
            }
            valid={!scheduledStartError}
            className={{ input: styles.scheduledTimeInput }}
          />
          <Typography
            type={TypographyType.Caption1}
            color={
              scheduledStartError
                ? TypographyColor.StatusError
                : TypographyColor.Tertiary
            }
          >
            {scheduledStartError ?? (
              <>
                {[scheduleDelta, `Timezone: ${timezoneLabel}`]
                  .filter(Boolean)
                  .join(' · ')}
                {' · '}
                <Link href={timezoneSettingsUrl} passHref>
                  <a className="text-text-link">Change timezone</a>
                </Link>
              </>
            )}
          </Typography>
        </div>
      ) : null}
      <div className="flex flex-col gap-1">
        <Typography type={TypographyType.Footnote} bold>
          Description{' '}
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            (optional)
          </Typography>
        </Typography>
        <RichTextInput
          initialContent={value.description}
          maxInputLength={STANDUP_DESCRIPTION_MAX_LENGTH}
          onValueUpdate={(next) => onChange({ ...value, description: next })}
          minHeightClassName="min-h-[8rem]"
          textareaProps={{
            name: 'description',
            'aria-label': 'Description',
            placeholder:
              'Add context, drop daily.dev posts to react to, or jot down questions for the room. Shown in the lobby while people RSVP, and in the Agenda tab once the standup is live.',
            maxLength: STANDUP_DESCRIPTION_MAX_LENGTH,
          }}
          className={{
            container: descriptionError ? 'border border-status-error' : '',
          }}
        />
        <Typography
          type={TypographyType.Caption1}
          color={
            descriptionError
              ? TypographyColor.StatusError
              : TypographyColor.Quaternary
          }
        >
          {descriptionError ??
            'Supports rich text, markdown shortcuts, and daily.dev post embeds.'}
        </Typography>
      </div>
    </div>
  );
};
