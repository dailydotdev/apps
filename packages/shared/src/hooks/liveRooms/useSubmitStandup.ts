import { useCallback } from 'react';
import zonedTimeToUtc from 'date-fns-tz/zonedTimeToUtc';
import { useCreateLiveRoom } from './useCreateLiveRoom';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useToastNotification } from '../useToastNotification';
import { LiveRoomMode, type LiveRoomJoinToken } from '../../graphql/liveRooms';
import { DEFAULT_TIMEZONE } from '../../lib/timezones';
import { LogEvent } from '../../lib/log';
import { labels } from '../../lib/labels';

export type StandupScheduleChoice = 'now' | 'later';

export interface SubmitStandupInput {
  topic: string;
  scheduleChoice: StandupScheduleChoice;
  scheduledStart?: string;
  description?: string;
}

export interface SubmitStandupFieldError {
  field: 'scheduledStart';
  message: string;
}

export type SubmitStandupResult =
  | { type: 'success'; joinToken: LiveRoomJoinToken }
  | { type: 'error'; error: SubmitStandupFieldError }
  | { type: 'failed' };

interface UseSubmitStandup {
  submit: (input: SubmitStandupInput) => Promise<SubmitStandupResult>;
  isPending: boolean;
}

export const useSubmitStandup = (): UseSubmitStandup => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { mutateAsync: createLiveRoom, isPending } = useCreateLiveRoom();

  const submit = useCallback(
    async (input: SubmitStandupInput): Promise<SubmitStandupResult> => {
      const timezone = user?.timezone || DEFAULT_TIMEZONE;
      const description = input.description?.trim();
      let scheduledStartUtc: string | undefined;

      if (input.scheduleChoice === 'later') {
        const parsed = input.scheduledStart
          ? zonedTimeToUtc(input.scheduledStart, timezone)
          : null;
        if (!parsed || Number.isNaN(parsed.getTime())) {
          return {
            type: 'error',
            error: {
              field: 'scheduledStart',
              message: 'Scheduled time is invalid',
            },
          };
        }
        if (parsed.getTime() <= Date.now()) {
          return {
            type: 'error',
            error: {
              field: 'scheduledStart',
              message: 'Scheduled time must be in the future',
            },
          };
        }
        scheduledStartUtc = parsed.toISOString();
      }

      try {
        const joinToken = await createLiveRoom({
          topic: input.topic.trim(),
          mode: LiveRoomMode.Moderated,
          scheduledStart: scheduledStartUtc,
          description: description || undefined,
        });
        logEvent({
          event_name: LogEvent.CreateStandup,
          target_id: joinToken.room.id,
          extra: JSON.stringify({
            scheduled: input.scheduleChoice === 'later',
            has_description: !!description,
            scheduled_start_delta_minutes: scheduledStartUtc
              ? Math.max(
                  0,
                  Math.round(
                    (new Date(scheduledStartUtc).getTime() - Date.now()) /
                      60_000,
                  ),
                )
              : null,
            timezone,
          }),
        });
        return { type: 'success', joinToken };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : labels.error.generic;
        displayToast(message);
        return { type: 'failed' };
      }
    },
    [user, logEvent, displayToast, createLiveRoom],
  );

  return { submit, isPending };
};
