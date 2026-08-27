import type { FormEvent } from 'react';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { usePostToSquad } from '../../../hooks';
import { useMultipleSourcePost } from '../../../features/squads/hooks/useMultipleSourcePost';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { useSubmitStandup } from '../../../hooks/liveRooms/useSubmitStandup';
import type {
  CreatePostInMultipleSourcesArgs,
  ExternalLinkPreview,
} from '../../../graphql/posts';
import type { Squad } from '../../../graphql/sources';
import { moderationRequired } from '../../squads/utils';
import { webappUrl } from '../../../lib/constants';
import { useAuthContext } from '../../../contexts/AuthContext';
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
import type { ResolvedScheduledAt } from '../schedule/useSchedulePost';

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
  editPostId?: string;
  resolveScheduledAt?: () => ResolvedScheduledAt;
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
  editPostId,
  resolveScheduledAt,
}: UseComposerSubmitProps): UseComposerSubmit => {
  const { displayToast } = useToastNotification();
  const router = useRouter();
  const { user } = useAuthContext();
  const { submit: submitStandupMutation, isPending: isCreatingStandup } =
    useSubmitStandup();
  const [standupErrors, setStandupErrors] = useState<StandupFieldErrors>({});
  const {
    getLinkPreview,
    isLoadingPreview,
    preview,
    isPosting,
    onSubmitPost,
    onSubmitFreeformPost,
    onEditFreeformPost,
    onSubmitPollPost,
  } = usePostToSquad({
    initialPreview,
    onComplete,
    displayMutationErrors: true,
    onPostSuccess: (post) => {
      if (editPostId) {
        return;
      }
      // Scheduled posts aren't visible yet, so don't navigate to the post
      // page — just confirm and let onComplete close the composer.
      if (post.flags?.scheduledAt) {
        displayToast('✅ Your post has been scheduled!');
        return;
      }
      router.push(
        post.commentsPermalink ?? `${webappUrl}posts/${post.slug ?? post.id}`,
      );
    },
  });
  const { onCreate: createMulti, isPending: isMultiPending } =
    useMultipleSourcePost({
      onSuccess: (result) => {
        onComplete();
        const isEveryItemPending = result.every(
          (item) => item.type === 'moderationItem',
        );
        if (isEveryItemPending || !user?.username) {
          return;
        }
        router.push(`${webappUrl}${user.username}/posts/`);
      },
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

  // Scheduling is single-source and non-moderated only. The `scheduledAt` here
  // is already gated by the caller (undefined unless the post is schedulable),
  // and it routes through the dedicated single-source mutation for each type.
  const submitText = async (scheduledAt?: string) => {
    const payload = {
      title: text.title.trim(),
      content: text.body,
      ...(cover?.file ? { image: cover.file } : {}),
    };
    if (editPostId) {
      await onEditFreeformPost(
        { ...payload, id: editPostId },
        primary as Squad,
      );
      displayToast(
        moderationRequired(primary as Squad)
          ? '✅ Your edit has been submitted for moderation'
          : '✅ Your post has been updated!',
      );
      return;
    }

    if (scheduledAt) {
      await onSubmitFreeformPost({ ...payload, scheduledAt }, primary as Squad);
      return;
    }

    if (isMulti) {
      await createMulti({
        sourceIds: selectedIds,
        ...payload,
      } as unknown as CreatePostInMultipleSourcesArgs);
    } else {
      await onSubmitFreeformPost(payload, primary as Squad);
    }
    displayToast(
      !isMulti && moderationRequired(primary as Squad)
        ? '✅ Your post has been submitted for moderation'
        : '✅ Your post has been created!',
    );
  };

  const submitPoll = async (scheduledAt?: string) => {
    const options = trimmedOptions(poll);
    const duration = poll.durationDays;
    if (!scheduledAt && isMulti) {
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
        ...(scheduledAt ? { scheduledAt } : {}),
      },
      primary as Squad,
    );
  };

  const submitLink = async (
    event: FormEvent<HTMLFormElement>,
    scheduledAt?: string,
  ) => {
    if (!isPreviewForComposerUrl(preview, link.url)) {
      displayToast('Invalid link');
      return;
    }
    const commentary = link.commentary.trim();
    if (!isMulti) {
      await onSubmitPost(event, primary as Squad, commentary, scheduledAt);
      // submitExternalLink returns no post, so onPostSuccess can't confirm it.
      if (scheduledAt && !preview?.id) {
        displayToast('✅ Your post has been scheduled!');
      }
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
    const result = await submitStandupMutation(standup);
    if (result.type === 'error') {
      setStandupErrors({ [result.error.field]: result.error.message });
      return;
    }
    if (result.type === 'failed') {
      return;
    }
    onComplete();
    router.push(`/standups/${result.joinToken.room.id}`);
  };

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (getIsSubmitDisabled()) {
        return;
      }
      if (kind === 'standup') {
        await submitStandup();
        return;
      }

      let scheduledAt: string | undefined;
      if (!editPostId) {
        const schedule = resolveScheduledAt?.() ?? {};
        if (schedule.error) {
          displayToast(schedule.error);
          return;
        }
        scheduledAt = schedule.iso;
      }

      if (kind === 'text') {
        await submitText(scheduledAt);
        return;
      }
      if (kind === 'poll') {
        await submitPoll(scheduledAt);
        return;
      }
      await submitLink(event, scheduledAt);
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
      editPostId,
      resolveScheduledAt,
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
