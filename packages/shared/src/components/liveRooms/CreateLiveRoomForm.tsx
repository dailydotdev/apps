import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import zonedTimeToUtc from 'date-fns-tz/zonedTimeToUtc';
import { Radio } from '../fields/Radio';
import { Checkbox } from '../fields/Checkbox';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonVariant } from '../buttons/Button';
import ControlledTextField from '../fields/ControlledTextField';
import { TextField } from '../fields/TextField';
import RichTextInput from '../fields/RichTextInput';
import { type LiveRoomJoinToken, LiveRoomMode } from '../../graphql/liveRooms';
import { useCreateLiveRoom } from '../../hooks/liveRooms/useCreateLiveRoom';
import { useToastNotification } from '../../hooks/useToastNotification';
import { labels } from '../../lib/labels';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import {
  dateFormatInTimezone,
  DEFAULT_TIMEZONE,
  getTimezoneOffsetLabel,
} from '../../lib/timezones';
import { timezoneSettingsUrl } from '../../lib/constants';
import Link from '../utilities/Link';
import { LogEvent } from '../../lib/log';
import styles from './CreateLiveRoomForm.module.css';

const DEFAULT_FREE_FOR_ALL_SPEAKER_LIMIT = 4;
const DEFAULT_SCHEDULE_DELAY_MS = 30 * 60 * 1000;
const DESCRIPTION_MAX_LENGTH = 4000;

const speakerLimitFieldSchema = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  return Number(value);
}, z.number().int().positive('Speaker limit must be at least 1').optional());

const createLiveRoomFormSchema = z
  .object({
    topic: z
      .string()
      .trim()
      .min(1, 'Topic is required')
      .max(280, 'Topic must be 280 characters or less'),
    mode: z.nativeEnum(LiveRoomMode),
    speakerLimit: speakerLimitFieldSchema,
    scheduledStartEnabled: z.boolean(),
    scheduledStart: z.string().optional(),
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
    if (
      values.mode === LiveRoomMode.FreeForAll &&
      values.speakerLimit === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['speakerLimit'],
        message: 'Speaker limit is required for free-for-all standups',
      });
    }

    if (values.scheduledStartEnabled && !values.scheduledStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['scheduledStart'],
        message: 'Scheduled time is required',
      });
    }
  });

type CreateLiveRoomFormValues = z.infer<typeof createLiveRoomFormSchema>;

const CREATE_LIVE_ROOM_FORM_ID = 'create-live-room-form';

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
  onCancel: () => void;
  onCreated: (joinToken: LiveRoomJoinToken) => void;
}

export const CreateLiveRoomForm = ({
  onCancel,
  onCreated,
}: CreateLiveRoomFormProps): ReactElement => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { mutateAsync: createLiveRoom, isPending } = useCreateLiveRoom();
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
      speakerLimit: DEFAULT_FREE_FOR_ALL_SPEAKER_LIMIT,
      scheduledStartEnabled: false,
      scheduledStart: defaultScheduledStart,
      description: '',
    },
  });
  const selectedMode = form.watch('mode');
  const scheduledStartEnabled = form.watch('scheduledStartEnabled');
  const scheduledStart = form.watch('scheduledStart');
  const scheduledStartDate = parseScheduledStart(scheduledStart, timezone);
  const scheduleDelta = scheduledStartEnabled
    ? formatScheduleDelta(scheduledStartDate)
    : null;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      let scheduledStartUtc: string | undefined;
      if (values.scheduledStartEnabled) {
        const parsedScheduledStart = parseScheduledStart(
          values.scheduledStart,
          timezone,
        );
        if (!parsedScheduledStart) {
          form.setError('scheduledStart', {
            message: 'Scheduled time is invalid',
          });
          return;
        }

        if (parsedScheduledStart.getTime() <= Date.now()) {
          form.setError('scheduledStart', {
            message: 'Scheduled time must be in the future',
          });
          return;
        }

        scheduledStartUtc = parsedScheduledStart.toISOString();
      }

      const joinToken = await createLiveRoom({
        topic: values.topic,
        mode: values.mode,
        speakerLimit:
          values.mode === LiveRoomMode.FreeForAll
            ? values.speakerLimit
            : undefined,
        scheduledStart: scheduledStartUtc,
        description: values.description || undefined,
      });
      logEvent({
        event_name: LogEvent.CreateStandup,
        target_id: joinToken.room.id,
        extra: JSON.stringify({
          scheduled: values.scheduledStartEnabled,
          has_description: !!values.description,
          scheduled_start_delta_minutes: scheduledStartUtc
            ? Math.max(
                0,
                Math.round(
                  (new Date(scheduledStartUtc).getTime() - Date.now()) / 60_000,
                ),
              )
            : null,
          timezone,
        }),
      });
      onCreated(joinToken);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : labels.error.generic;
      displayToast(message);
    }
  });

  return (
    <FormProvider {...form}>
      <form
        id={CREATE_LIVE_ROOM_FORM_ID}
        onSubmit={onSubmit}
        className="flex flex-col gap-4"
      >
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Pick a topic, choose how the stage works, and optionally open a lobby
          before going live.
        </Typography>
        <ControlledTextField
          name="topic"
          label="Topic"
          placeholder="What do you want to talk about?"
        />
        <div className="flex flex-col gap-3">
          <Typography type={TypographyType.Footnote} bold>
            Standup mode
          </Typography>
          <Radio
            name="mode"
            value={form.watch('mode')}
            onChange={(value) => {
              form.setValue('mode', value, {
                shouldDirty: true,
                shouldValidate: true,
              });
              if (
                value === LiveRoomMode.FreeForAll &&
                form.getValues('speakerLimit') === undefined
              ) {
                form.setValue(
                  'speakerLimit',
                  DEFAULT_FREE_FOR_ALL_SPEAKER_LIMIT,
                  {
                    shouldDirty: true,
                  },
                );
              }
            }}
            options={[
              {
                value: LiveRoomMode.Moderated,
                label: 'Moderated',
                afterElement: (
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                    className="pl-10"
                  >
                    People join a queue and the host brings them on stage.
                  </Typography>
                ),
              },
              {
                value: LiveRoomMode.FreeForAll,
                label: 'Free for all',
                afterElement: (
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                    className="pl-10"
                  >
                    Anyone can hop on stage until the speaker limit you set is
                    full.
                  </Typography>
                ),
              },
            ]}
          />
        </div>
        <Controller
          control={form.control}
          name="scheduledStartEnabled"
          render={({ field }) => (
            <Checkbox
              name={field.name}
              checked={field.value}
              onToggleCallback={(checked) => {
                field.onChange(checked);
                if (checked && !form.getValues('scheduledStart')) {
                  form.setValue('scheduledStart', defaultScheduledStart, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
            >
              Schedule a lobby before going live
            </Checkbox>
          )}
        />
        {scheduledStartEnabled ? (
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
                  fieldType="secondary"
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
                What&apos;s this about?
              </Typography>
              <RichTextInput
                initialContent={field.value ?? ''}
                maxInputLength={DESCRIPTION_MAX_LENGTH}
                onValueUpdate={field.onChange}
                minHeightClassName="min-h-[10rem]"
                textareaProps={{
                  name: field.name,
                  'aria-label': "What's this about?",
                  placeholder:
                    "Outline what you'll cover, drop daily.dev posts to react to, or jot down questions for the room.",
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
        {selectedMode === LiveRoomMode.FreeForAll ? (
          <Controller
            control={form.control}
            name="speakerLimit"
            render={({ field, fieldState }) => (
              <TextField
                inputId={field.name}
                name={field.name}
                label="Speaker limit"
                type="number"
                min={1}
                placeholder={String(DEFAULT_FREE_FOR_ALL_SPEAKER_LIMIT)}
                fieldType="secondary"
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                valid={!fieldState.error}
                hint={
                  fieldState.error?.message ??
                  'How many audience members can be on stage at once.'
                }
              />
            )}
          />
        ) : null}
        <div className="mt-2 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant={ButtonVariant.Primary}
            loading={isPending}
          >
            Create standup
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default CreateLiveRoomForm;
