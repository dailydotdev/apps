import type { FormEvent } from 'react';
import { useCallback } from 'react';
import { usePostToSquad } from '../../../hooks';
import { useMultipleSourcePost } from '../../../features/squads/hooks/useMultipleSourcePost';
import { useToastNotification } from '../../../hooks/useToastNotification';
import type {
  CreatePostInMultipleSourcesArgs,
  ExternalLinkPreview,
} from '../../../graphql/posts';
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
}: UseComposerSubmitProps): UseComposerSubmit => {
  const { displayToast } = useToastNotification();
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

  const isInFlight = isPosting || isMultiPending;

  const getIsSubmitDisabled = (): boolean => {
    if (isInFlight || !primary) {
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
  };
};
