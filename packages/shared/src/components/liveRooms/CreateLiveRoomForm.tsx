import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import zonedTimeToUtc from 'date-fns-tz/zonedTimeToUtc';
import { Radio } from '../fields/Radio';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonVariant } from '../buttons/Button';
import ControlledTextField from '../fields/ControlledTextField';
import { TextField } from '../fields/TextField';
import RichTextInput from '../fields/RichTextInput';
import { LiveRoomMode, type LiveRoomJoinToken } from '../../graphql/liveRooms';
import { useSubmitStandup } from '../../hooks/liveRooms/useSubmitStandup';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  dateFormatInTimezone,
  DEFAULT_TIMEZONE,
  getTimezoneOffsetLabel,
} from '../../lib/timezones';
import { timezoneSettingsUrl } from '../../lib/constants';
import Link from '../utilities/Link';
import { CREATE_LIVE_ROOM_FORM_ID } from '../fields/form/common';
import styles from './CreateLiveRoomForm.module.css';

const DEFAULT_SCHEDULE_DELAY_MS = 30 * 60 * 1000;
const DEFAULT_COMMUNITY_MIN_PARTICIPANTS = 3;
const TOPIC_MAX_LENGTH = 280;
const DESCRIPTION_MAX_LENGTH = 4000;

type RoomModeChoice = LiveRoomMode.Moderated | LiveRoomMode.CommunityModerated;
type ScheduleChoice = 'now' | 'later';

const optionalPositiveInteger = (message: string) =>
  z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    if (typeof value === 'string') {
      return Number(value);
    }
    return value;
  }, z.number({ message }).int(message).positive(message).optional());

const createLiveRoomFormSchema = z
  .object({
    topic: z
      .string()
      .trim()
      .min(1, 'Topic is required')
      .max(
        TOPIC_MAX_LENGTH,
        `Topic must be ${TOPIC_MAX_LENGTH} characters or less`,
      ),
    mode: z.enum([LiveRoomMode.Moderated, LiveRoomMode.CommunityModerated]),
    scheduleChoice: z.enum(['now', 'later']),
    scheduledStart: z.string().optional(),
    minParticipantsToGoLive: optionalPositiveInteger(
      'Enter at least 2 participants',
    ),
    speakerLimit: optionalPositiveInteger('Enter a speaker limit'),
    description: z
      .string()
      .trim()
      .max(
        DESCRIPTION_MAX_LENGTH,
        'Description must be 4000 characters or less',
      )
      .optional(),
  })
  .superRefine((values, ctx) => {
    if (values.scheduleChoice === 'later' && !values.scheduledStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['scheduledStart'],
        message: 'Scheduled time is required',
      });
    }

    if (values.mode !== LiveRoomMode.CommunityModerated) {
      return;
    }

    if (!values.minParticipantsToGoLive) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['minParticipantsToGoLive'],
        message:
          'Minimum participants is required for community-moderated rooms',
      });
      return;
    }

    if (values.minParticipantsToGoLive < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['minParticipantsToGoLive'],
        message: 'Community rooms need at least 2 participants',
      });
    }

    if (
      values.speakerLimit &&
      values.minParticipantsToGoLive > values.speakerLimit
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['speakerLimit'],
        message:
          'Speaker limit must be greater than or equal to the participant minimum',
      });
    }
  });

type CreateLiveRoomFormValues = z.infer<typeof createLiveRoomFormSchema>;

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

const parseScheduledStart = (value: string | undefined, timezone: string) => {
  if (!value) {
    return null;
  }

  const date = zonedTimeToUtc(value, timezone);
  return Number.isNaN(date.getTime()) ? null : date;
};

interface CreateLiveRoomFormProps {
  onCreated: (joinToken: LiveRoomJoinToken) => void;
}

export const CreateLiveRoomForm = ({
  onCreated,
}: CreateLiveRoomFormProps): ReactElement => {
  const { user } = useAuthContext();
  const { submit: submitStandup, isPending } = useSubmitStandup();
  const timezone = user?.timezone || DEFAULT_TIMEZONE;
  const timezoneLabel = getTimezoneOffsetLabel(timezone);
  const defaultScheduledStart = useMemo(
    () => getDefaultScheduledStart(timezone),
    [timezone],
  );

  const form = useForm<CreateLiveRoomFormValues>({
    resolver: zodResolver(createLiveRoomFormSchema),
    defaultValues: {
      topic: '',
      mode: LiveRoomMode.Moderated,
      scheduleChoice: 'now',
      scheduledStart: defaultScheduledStart,
      minParticipantsToGoLive: undefined,
      speakerLimit: undefined,
      description: '',
    },
  });
  const roomMode = form.watch('mode');
  const scheduleChoice = form.watch('scheduleChoice');
  const scheduledStart = form.watch('scheduledStart');
  const scheduledStartDate = parseScheduledStart(scheduledStart, timezone);
  const isCommunityModerated = roomMode === LiveRoomMode.CommunityModerated;
  const isScheduled = scheduleChoice === 'later';
  const scheduleDelta = isScheduled
    ? formatScheduleDelta(scheduledStartDate)
    : null;
  const submitCopy = isScheduled ? 'Schedule standup' : 'Create standup';
  let submissionHint =
    "You'll be asked for camera and microphone access before going live.";

  if (isScheduled) {
    submissionHint =
      "We'll open the lobby right away and share a post on your feed so people can RSVP. You can go live at the scheduled time.";
  }

  if (isCommunityModerated) {
    submissionHint = isScheduled
      ? "We'll open the lobby right away and share a post on your feed so people can RSVP."
      : 'Community rooms become live automatically once enough participants join.';
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await submitStandup(values);
    if (result.type === 'error') {
      form.setError(result.error.field, { message: result.error.message });
      return;
    }
    if (result.type === 'success') {
      onCreated(result.joinToken);
    }
  });

  return (
    <FormProvider {...form}>
      <form
        id={CREATE_LIVE_ROOM_FORM_ID}
        onSubmit={onSubmit}
        className="flex flex-col gap-5"
      >
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {isCommunityModerated
            ? 'Community-moderated standups let authenticated speakers join directly and go live once enough participants are in the room.'
            : "Standups are short, host-led audio and video rooms on daily.dev. Pick a topic, optionally schedule it, and go live when you're ready. Standups don't start automatically."}
        </Typography>
        <ControlledTextField
          name="topic"
          label="Topic"
          placeholder="What do you want to talk about?"
          maxLength={TOPIC_MAX_LENGTH}
          hint='Keep it short and specific. Examples: "AMA: shipping a side project in 24h", "Live code review: Next.js refactor".'
        />
        <Controller
          control={form.control}
          name="mode"
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <Typography type={TypographyType.Footnote} bold>
                Room type
              </Typography>
              <Radio<RoomModeChoice>
                name={field.name}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  if (value === LiveRoomMode.CommunityModerated) {
                    form.setValue(
                      'minParticipantsToGoLive',
                      form.getValues('minParticipantsToGoLive') ??
                        DEFAULT_COMMUNITY_MIN_PARTICIPANTS,
                      { shouldDirty: true, shouldValidate: true },
                    );
                    return;
                  }
                  form.setValue('minParticipantsToGoLive', undefined, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  form.setValue('speakerLimit', undefined, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                options={[
                  {
                    value: LiveRoomMode.Moderated,
                    label: 'Host moderated',
                    className: { wrapper: 'gap-0' },
                    afterElement: (
                      <Typography
                        type={TypographyType.Caption1}
                        color={TypographyColor.Tertiary}
                        className="-mt-1 pl-10"
                      >
                        The host controls when the room goes live and who can
                        speak.
                      </Typography>
                    ),
                  },
                  {
                    value: LiveRoomMode.CommunityModerated,
                    label: 'Community moderated',
                    className: { wrapper: 'gap-0' },
                    afterElement: (
                      <Typography
                        type={TypographyType.Caption1}
                        color={TypographyColor.Tertiary}
                        className="-mt-1 pl-10"
                      >
                        Speakers can join directly. The room becomes live after
                        the participant minimum is reached.
                      </Typography>
                    ),
                  },
                ]}
              />
            </div>
          )}
        />
        {isCommunityModerated ? (
          <div className="grid gap-3 tablet:grid-cols-2">
            <Controller
              control={form.control}
              name="minParticipantsToGoLive"
              render={({ field, fieldState }) => (
                <TextField
                  inputId={field.name}
                  name={field.name}
                  label="Minimum participants"
                  aria-label="Minimum participants to go live"
                  type="number"
                  min={2}
                  step={1}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  valid={!fieldState.error}
                  hint={
                    fieldState.error?.message ??
                    'The room becomes live once this many participants join.'
                  }
                />
              )}
            />
            <Controller
              control={form.control}
              name="speakerLimit"
              render={({ field, fieldState }) => (
                <TextField
                  inputId={field.name}
                  name={field.name}
                  label="Speaker limit"
                  aria-label="Speaker limit"
                  type="number"
                  min={1}
                  step={1}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  valid={!fieldState.error}
                  hint={fieldState.error?.message ?? 'Optional cap.'}
                />
              )}
            />
          </div>
        ) : null}
        <Controller
          control={form.control}
          name="scheduleChoice"
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <Typography type={TypographyType.Footnote} bold>
                When do you want to start?
              </Typography>
              <Radio<ScheduleChoice>
                name={field.name}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  if (value === 'later' && !form.getValues('scheduledStart')) {
                    form.setValue('scheduledStart', defaultScheduledStart, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }
                }}
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
                        {isCommunityModerated
                          ? 'Open the room immediately. It becomes live once the participant minimum is reached.'
                          : 'Open the room immediately. You will still need to click "Go live" before listeners can join.'}
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
                        {isCommunityModerated
                          ? 'Open a lobby where people can RSVP, chat, and get notified when the room is live.'
                          : 'Open a lobby where people can RSVP, chat, and get notified when you go live.'}
                      </Typography>
                    ),
                  },
                ]}
              />
            </div>
          )}
        />
        {isScheduled ? (
          <Controller
            control={form.control}
            name="scheduledStart"
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1">
                <TextField
                  inputId={field.name}
                  name={field.name}
                  label="Scheduled time"
                  aria-label="Scheduled time"
                  type="datetime-local"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  valid={!fieldState.error}
                  className={{ input: styles.scheduledTimeInput }}
                />
                <Typography
                  type={TypographyType.Caption1}
                  color={
                    fieldState.error
                      ? TypographyColor.StatusError
                      : TypographyColor.Tertiary
                  }
                >
                  {fieldState.error?.message ?? (
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
            )}
          />
        ) : null}
        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
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
                initialContent={field.value ?? ''}
                maxInputLength={DESCRIPTION_MAX_LENGTH}
                onValueUpdate={field.onChange}
                minHeightClassName="min-h-[8rem]"
                textareaProps={{
                  name: field.name,
                  'aria-label': 'Description',
                  placeholder:
                    'Add context, drop daily.dev posts to react to, or jot down questions for the room. Shown in the lobby while people RSVP, and in the Agenda tab once the standup is live.',
                  maxLength: DESCRIPTION_MAX_LENGTH,
                }}
                className={{
                  container: fieldState.error
                    ? 'border border-status-error'
                    : '',
                }}
              />
              <Typography
                type={TypographyType.Caption1}
                color={
                  fieldState.error
                    ? TypographyColor.StatusError
                    : TypographyColor.Quaternary
                }
              >
                {fieldState.error?.message ??
                  'Supports rich text, markdown shortcuts, and daily.dev post embeds.'}
              </Typography>
            </div>
          )}
        />
        <div className="mt-2 hidden items-center justify-end gap-3 laptop:flex">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="min-w-0 flex-1"
          >
            {submissionHint}
          </Typography>
          <Button
            type="submit"
            variant={ButtonVariant.Primary}
            loading={isPending}
          >
            {submitCopy}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default CreateLiveRoomForm;
