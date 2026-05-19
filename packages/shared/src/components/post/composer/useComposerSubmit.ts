import type { FormEvent } from 'react';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import zonedTimeToUtc from 'date-fns-tz/zonedTimeToUtc';
import { usePostToSquad } from '../../../hooks';
import { useMultipleSourcePost } from '../../../features/squads/hooks/useMultipleSourcePost';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useCreateLiveRoom } from '../../../hooks/liveRooms/useCreateLiveRoom';
import { LiveRoomMode } from '../../../graphql/liveRooms';
import { DEFAULT_TIMEZONE } from '../../../lib/timezones';
import { LogEvent } from '../../../lib/log';
import { labels } from '../../../lib/labels';
import type {
  CreatePostInMultipleSourcesArgs,
  ExternalLinkPreview,
} from '../../../graphql/posts';
import type { Squad } from '../../../graphql/sources';
import {
  POLL_OPTIONS_MIN,
  STANDUP_TOPIC_MAX_LENGTH,
  type ComposerKind,
  type LinkFormState,
  type PollFormState,
  type StandupFormState,
  type TextFormState,
} from './types';
import type { TextFormCover } from './TextForm';
import { isPreviewForComposerUrl } from './utils';

export interface StandupFieldErrors {
  topic?: string;
  scheduledStart?: string;
  description?: string;
}

const trimmedOptions = (state: PollFormState): string[] =>
  state.options.map((option) => option.trim()).filter(Boolean);

const isTextValid = (state: TextFormState): boolean =>
  !!state.title.trim() && !!state.body.trim();

const isLinkValid = (
  state: LinkFormState,
  preview: ExternalLinkPreview | undefined,
): boolean =>
  !!preview?.title &&
  !!(preview.url || preview.permalink) &&
  isPreviewForComposerUrl(preview, state.url);

const isPollValid = (state: PollFormState): boolean =>
  !!state.question.trim() && trimmedOptions(state).length >= POLL_OPTIONS_MIN;

const isStandupValid = (state: StandupFormState): boolean => {
  const topic = state.topic.trim();
  if (!topic || topic.length > STANDUP_TOPIC_MAX_LENGTH) {
    return false;
  }
  if (state.scheduleChoice === 'later' && !state.scheduledStart) {
    return false;
  }
  return true;
};

interface UseComposerSubmitProps {
  kind: ComposerKind;
  text: TextFormState;
  link: LinkFormState;
  poll: PollFormState;
  standup: StandupFormState;
  cover: TextFormCover | null;
  primary: Squad | undefined;
  selectedIds: string[];
  isMulti: boolean;
  initialPreview?: ExternalLinkPreview;
  onComplete: () => void;
}

interface UseComposerSubmit {
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  isSubmitDisabled: boolean;
  isInFlight: boolean;
  preview: ExternalLinkPreview | undefined;
  isLoadingPreview: boolean;
  fetchPreview: (url?: string) => void;
  standupErrors: StandupFieldErrors;
}

export const useComposerSubmit = ({
  kind,
  text,
  link,
  poll,
  standup,
  cover,
  primary,
  selectedIds,
  isMulti,
  initialPreview,
  onComplete,
}: UseComposerSubmitProps): UseComposerSubmit => {
  const { displayToast } = useToastNotification();
  const router = useRouter();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { mutateAsync: createLiveRoom, isPending: isCreatingStandup } =
    useCreateLiveRoom();
  const [standupErrors, setStandupErrors] = useState<StandupFieldErrors>({});
  const {
    getLinkPreview,
    isLoadingPreview,
    preview,
    isPosting,
    onSubmitPost,
    onSubmitFreeformPost,
    onSubmitPollPost,
  } = usePostToSquad({
    initialPreview,
    onComplete,
    displayMutationErrors: true,
  });
  const { onCreate: createMulti, isPending: isMultiPending } =
    useMultipleSourcePost({
      onSuccess: onComplete,
      onError: (error) =>
        displayToast(error.response?.errors?.[0]?.message ?? 'Failed to post'),
    });

  const fetchPreview = useCallback(
    (url?: string) => {
      if (!url) {
        return;
      }
      // surfaced via usePostToSquad toast
      getLinkPreview(url).catch(() => undefined);
    },
    [getLinkPreview],
  );

  const isInFlight = isPosting || isMultiPending || isCreatingStandup;

  const getIsSubmitDisabled = (): boolean => {
    if (isInFlight) {
      return true;
    }
    if (kind === 'standup') {
      return !isStandupValid(standup);
    }
    if (!primary) {
      return true;
    }
    if (kind === 'text') {
      return !isTextValid(text);
    }
    if (kind === 'link') {
      return !isLinkValid(link, preview);
    }
    return !isPollValid(poll);
  };

  const submitText = async () => {
    const payload = {
      title: text.title.trim(),
      content: text.body,
      ...(cover?.file ? { image: cover.file } : {}),
    };
    if (isMulti) {
      await createMulti({
        sourceIds: selectedIds,
        ...payload,
      } as unknown as CreatePostInMultipleSourcesArgs);
      return;
    }
    await onSubmitFreeformPost(payload, primary as Squad);
  };

  const submitPoll = async () => {
    const options = trimmedOptions(poll);
    const duration = poll.durationDays;
    if (isMulti) {
      await createMulti({
        sourceIds: selectedIds,
        title: poll.question.trim(),
        options: options.map((value, order) => ({ text: value, order })),
        ...(duration != null ? { duration } : {}),
      } as unknown as CreatePostInMultipleSourcesArgs);
      return;
    }
    await onSubmitPollPost(
      {
        title: poll.question.trim(),
        options,
        ...(duration != null ? { duration } : {}),
      },
      primary as Squad,
    );
  };

  const submitLink = async (event: FormEvent<HTMLFormElement>) => {
    if (!isPreviewForComposerUrl(preview, link.url)) {
      displayToast('Invalid link');
      return;
    }
    const commentary = link.commentary.trim();
    if (!isMulti) {
      await onSubmitPost(event, primary as Squad, commentary);
      return;
    }
    const url = preview?.finalUrl ?? preview?.url;
    if (!url || !preview?.title) {
      return;
    }
    const sharedArgs = preview.id
      ? { sharedPostId: preview.id }
      : { externalLink: url, title: preview.title, imageUrl: preview.image };
    await createMulti({
      sourceIds: selectedIds,
      commentary,
      ...sharedArgs,
    } as unknown as CreatePostInMultipleSourcesArgs);
  };

  const submitStandup = async () => {
    setStandupErrors({});
    const timezone = user?.timezone || DEFAULT_TIMEZONE;
    let scheduledStartUtc: string | undefined;

    if (standup.scheduleChoice === 'later') {
      const parsed = standup.scheduledStart
        ? zonedTimeToUtc(standup.scheduledStart, timezone)
        : null;
      if (!parsed || Number.isNaN(parsed.getTime())) {
        setStandupErrors({ scheduledStart: 'Scheduled time is invalid' });
        return;
      }
      if (parsed.getTime() <= Date.now()) {
        setStandupErrors({
          scheduledStart: 'Scheduled time must be in the future',
        });
        return;
      }
      scheduledStartUtc = parsed.toISOString();
    }

    try {
      const joinToken = await createLiveRoom({
        topic: standup.topic.trim(),
        mode: LiveRoomMode.Moderated,
        scheduledStart: scheduledStartUtc,
        description: standup.description.trim() || undefined,
      });
      logEvent({
        event_name: LogEvent.CreateStandup,
        target_id: joinToken.room.id,
        extra: JSON.stringify({
          scheduled: standup.scheduleChoice === 'later',
          has_description: !!standup.description.trim(),
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
      onComplete();
      router.push(`/standups/${joinToken.room.id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : labels.error.generic;
      displayToast(message);
    }
  };

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (getIsSubmitDisabled()) {
        return;
      }
      if (kind === 'text') {
        await submitText();
        return;
      }
      if (kind === 'poll') {
        await submitPoll();
        return;
      }
      if (kind === 'standup') {
        await submitStandup();
        return;
      }
      await submitLink(event);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      kind,
      isMulti,
      primary,
      preview,
      text,
      link,
      poll,
      standup,
      cover,
      selectedIds,
      isInFlight,
    ],
  );

  return {
    handleSubmit,
    isSubmitDisabled: getIsSubmitDisabled(),
    isInFlight,
    preview,
    isLoadingPreview,
    fetchPreview,
    standupErrors,
  };
};
