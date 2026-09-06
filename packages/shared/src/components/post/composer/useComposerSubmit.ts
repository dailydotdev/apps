import type { FormEvent } from 'react';
import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { usePostToSquad } from '../../../hooks';
import { useMultipleSourcePost } from '../../../features/squads/hooks/useMultipleSourcePost';
import { useToastNotification } from '../../../hooks/useToastNotification';
import type { ExternalLinkPreview } from '../../../graphql/posts';
import type { Squad } from '../../../graphql/sources';
import { moderationRequired } from '../../squads/utils';
import { webappUrl } from '../../../lib/constants';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  POLL_OPTIONS_MIN,
  type ComposerKind,
  type LinkFormState,
  type PollFormState,
  type TextFormState,
} from './types';
import type { TextFormCover } from './TextForm';
import { isPreviewForComposerUrl } from './utils';
import type { ResolvedScheduledAt } from '../schedule/useSchedulePost';

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

interface UseComposerSubmitProps {
  kind: ComposerKind;
  text: TextFormState;
  link: LinkFormState;
  poll: PollFormState;
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
}

export const useComposerSubmit = ({
  kind,
  text,
  link,
  poll,
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
  const {
    getLinkPreview,
    isLoadingPreview,
    preview,
    isPosting,
    onSubmitPost,
    onSubmitFreeformPost,
    onEditFreeformPost,
    onSubmitPollPost,
    onUpdateSharePost,
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

  const isInFlight = isPosting || isMultiPending;

  const getIsSubmitDisabled = (): boolean => {
    if (isInFlight) {
      return true;
    }
    if (!primary) {
      return true;
    }
    if (kind === 'text') {
      // Freeform posts can legitimately have no body (title + cover only),
      // so an edit only requires the title.
      return editPostId ? !text.title.trim() : !isTextValid(text);
    }
    if (kind === 'link') {
      // Editing keeps the original link — there is no URL/preview to validate.
      return editPostId ? false : !isLinkValid(link, preview);
    }
    return !isPollValid(poll);
  };

  // Scheduling is single-source and non-moderated only. The `scheduledAt` here
  // is already gated by the caller (undefined unless the post is schedulable),
  // and it routes through the dedicated single-source mutation for each type.
  const submitText = async (squad: Squad, scheduledAt?: string) => {
    const payload = {
      title: text.title.trim(),
      content: text.body,
      ...(cover?.file ? { image: cover.file } : {}),
    };
    if (editPostId) {
      await onEditFreeformPost({ ...payload, id: editPostId }, squad);
      displayToast(
        moderationRequired(squad)
          ? '✅ Your edit has been submitted for moderation'
          : '✅ Your post has been updated!',
      );
      return;
    }

    if (scheduledAt) {
      await onSubmitFreeformPost({ ...payload, scheduledAt }, squad);
      return;
    }

    if (isMulti) {
      await createMulti({
        sourceIds: selectedIds,
        ...payload,
      });
    } else {
      await onSubmitFreeformPost(payload, squad);
    }
    displayToast(
      !isMulti && moderationRequired(squad)
        ? '✅ Your post has been submitted for moderation'
        : '✅ Your post has been created!',
    );
  };

  const submitPoll = async (squad: Squad, scheduledAt?: string) => {
    const options = trimmedOptions(poll);
    const duration = poll.durationDays;
    if (!scheduledAt && isMulti) {
      await createMulti({
        sourceIds: selectedIds,
        title: poll.question.trim(),
        options: options.map((value, order) => ({ text: value, order })),
        ...(duration != null ? { duration } : {}),
      });
      return;
    }
    await onSubmitPollPost(
      {
        title: poll.question.trim(),
        options,
        ...(duration != null ? { duration } : {}),
        ...(scheduledAt ? { scheduledAt } : {}),
      },
      squad,
    );
  };

  const submitLink = async (
    event: FormEvent<HTMLFormElement>,
    squad: Squad,
    scheduledAt?: string,
  ) => {
    if (editPostId) {
      await onUpdateSharePost(event, editPostId, link.commentary.trim(), squad);
      // The plain update path toasts from usePostToSquad; the moderation one
      // completes silently, so it is the only case that needs confirming here.
      if (moderationRequired(squad)) {
        displayToast('✅ Your edit has been submitted for moderation');
      }
      return;
    }
    if (!isPreviewForComposerUrl(preview, link.url)) {
      displayToast('Invalid link');
      return;
    }
    const commentary = link.commentary.trim();
    if (!isMulti) {
      await onSubmitPost(event, squad, commentary, scheduledAt);
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
    });
  };

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (getIsSubmitDisabled()) {
        return;
      }
      if (!primary) {
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
        await submitText(primary, scheduledAt);
        return;
      }
      if (kind === 'poll') {
        await submitPoll(primary, scheduledAt);
        return;
      }
      await submitLink(event, primary, scheduledAt);
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
  };
};
