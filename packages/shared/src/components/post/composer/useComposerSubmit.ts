import type { FormEvent } from 'react';
import { useCallback, useMemo } from 'react';
import { usePostToSquad } from '../../../hooks';
import { useMultipleSourcePost } from '../../../features/squads/hooks/useMultipleSourcePost';
import { useToastNotification } from '../../../hooks/useToastNotification';
import type {
  CreatePostInMultipleSourcesArgs,
  ExternalLinkPreview,
} from '../../../graphql/posts';
import type { ApiErrorResult } from '../../../graphql/common';
import { DEFAULT_ERROR } from '../../../graphql/common';
import type { Squad } from '../../../graphql/sources';
import {
  POLL_OPTIONS_MIN,
  type ComposerKind,
  type LinkFormState,
  type PollFormState,
  type TextFormState,
} from './types';
import type { TextFormCover } from './TextForm';
import { isPreviewForComposerUrl } from './utils';

const isApiErrorResult = (error: unknown): error is ApiErrorResult =>
  !!(error as ApiErrorResult)?.response?.errors;

const isTextValid = (state: TextFormState): boolean =>
  state.title.trim().length > 0 && state.body.trim().length > 0;

const isLinkValid = (preview?: ExternalLinkPreview): boolean =>
  Boolean(preview?.title && (preview.url || preview.permalink));

const isPollValid = (state: PollFormState): boolean => {
  if (!state.question.trim()) {
    return false;
  }
  const filled = state.options.map((option) => option.trim()).filter(Boolean);
  return filled.length >= POLL_OPTIONS_MIN;
};

const filledPollOptions = (state: PollFormState): string[] =>
  state.options.map((option) => option.trim()).filter(Boolean);

interface UseComposerSubmitProps {
  kind: ComposerKind;
  text: TextFormState;
  link: LinkFormState;
  poll: PollFormState;
  cover: TextFormCover | null;
  primary: Squad | undefined;
  selected: Squad[];
  selectedIds: string[];
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
}

export const useComposerSubmit = ({
  kind,
  text,
  link,
  poll,
  cover,
  primary,
  selected,
  selectedIds,
  initialPreview,
  onComplete,
}: UseComposerSubmitProps): UseComposerSubmit => {
  const { displayToast } = useToastNotification();
  const handleError = useCallback(
    (error: ApiErrorResult) => {
      displayToast(error.response?.errors?.[0]?.message ?? DEFAULT_ERROR);
    },
    [displayToast],
  );
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
    useMultipleSourcePost({ onSuccess: onComplete, onError: handleError });

  const fetchPreview = useCallback(
    (url?: string) => {
      if (!url) {
        return;
      }
      getLinkPreview(url).catch(() => {
        // surfaced via usePostToSquad toast
      });
    },
    [getLinkPreview],
  );

  const isMulti = selected.length > 1;
  const isInFlight = isPosting || isMultiPending;

  const isSubmitDisabled = useMemo(() => {
    if (isInFlight || !primary) {
      return true;
    }
    if (kind === 'text') {
      return !isTextValid(text);
    }
    if (kind === 'link') {
      return (
        !isLinkValid(preview) || !isPreviewForComposerUrl(preview, link.url)
      );
    }
    return !isPollValid(poll);
  }, [isInFlight, kind, link.url, poll, preview, primary, text]);

  const submitMulti = useCallback(async () => {
    if (kind === 'text') {
      await createMulti({
        sourceIds: selectedIds,
        title: text.title.trim(),
        content: text.body,
        ...(cover?.file ? { image: cover.file } : {}),
      } as unknown as CreatePostInMultipleSourcesArgs);
      return;
    }
    if (kind === 'poll') {
      await createMulti({
        sourceIds: selectedIds,
        title: poll.question.trim(),
        options: filledPollOptions(poll).map((value, order) => ({
          text: value,
          order,
        })),
        ...(poll.durationDays != null ? { duration: poll.durationDays } : {}),
      } as unknown as CreatePostInMultipleSourcesArgs);
      return;
    }
    if (!isPreviewForComposerUrl(preview, link.url)) {
      displayToast('Invalid link');
      return;
    }

    const url = preview?.finalUrl ?? preview?.url;
    if (!url || !preview?.title) {
      return;
    }
    const commentary = link.commentary.trim();
    if (preview.id) {
      await createMulti({
        sourceIds: selectedIds,
        sharedPostId: preview.id,
        commentary,
      } as unknown as CreatePostInMultipleSourcesArgs);
      return;
    }
    await createMulti({
      sourceIds: selectedIds,
      externalLink: url,
      title: preview.title,
      imageUrl: preview.image,
      commentary,
    } as unknown as CreatePostInMultipleSourcesArgs);
  }, [
    createMulti,
    cover?.file,
    displayToast,
    kind,
    link.commentary,
    link.url,
    poll,
    preview,
    selectedIds,
    text,
  ]);

  const submitSingle = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      if (!primary) {
        return;
      }
      if (kind === 'text') {
        await onSubmitFreeformPost(
          {
            title: text.title.trim(),
            content: text.body,
            ...(cover?.file ? { image: cover.file } : {}),
          },
          primary,
        );
        return;
      }
      if (kind === 'link') {
        if (!isPreviewForComposerUrl(preview, link.url)) {
          displayToast('Invalid link');
          return;
        }

        await onSubmitPost(event, primary, link.commentary.trim());
        return;
      }
      await onSubmitPollPost(
        {
          title: poll.question.trim(),
          options: filledPollOptions(poll),
          ...(poll.durationDays != null ? { duration: poll.durationDays } : {}),
        },
        primary,
      );
    },
    [
      cover?.file,
      displayToast,
      kind,
      link.commentary,
      link.url,
      onSubmitFreeformPost,
      onSubmitPollPost,
      onSubmitPost,
      poll,
      preview,
      primary,
      text,
    ],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmitDisabled) {
        return;
      }
      try {
        if (isMulti) {
          await submitMulti();
          return;
        }
        await submitSingle(event);
      } catch (error) {
        if (isApiErrorResult(error)) {
          return;
        }

        throw error;
      }
    },
    [isMulti, isSubmitDisabled, submitMulti, submitSingle],
  );

  return {
    handleSubmit,
    isSubmitDisabled,
    isInFlight,
    preview,
    isLoadingPreview,
    fetchPreview,
  };
};
