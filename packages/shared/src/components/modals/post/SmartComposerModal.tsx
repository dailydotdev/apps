import type { FormEvent, ReactElement, KeyboardEvent } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import type { LazyModalCommonProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { ModalKind, ModalSize } from '../common/types';
import type { RichTextInputRef } from '../../fields/RichTextInput';
import RichTextInput from '../../fields/RichTextInput';
import { WriteLinkPreview } from '../../post/write/WriteLinkPreview';
import { WritePreviewSkeleton } from '../../post/write/WritePreviewSkeleton';
import { useDebouncedUrl } from '../../../hooks/input';
import { usePostToSquad, useViewSize, ViewSize } from '../../../hooks';
import { useMultipleSourcePost } from '../../../features/squads/hooks/useMultipleSourcePost';
import {
  useSmartComposer,
  cleanShareCommentary,
  type SmartComposerMode,
} from '../../../hooks/post/useSmartComposer';
import { getComposerVariant } from './composer/registry';
import type {
  ComposerKind,
  ComposerState,
  StandupConfig,
} from './composer/types';
import {
  DEFAULT_STANDUP_CONFIG,
  StandupBody,
} from './composer/variants/standup';
import { KindModePicker } from './composer/KindModePicker';
import { useCreateLiveRoom } from '../../../hooks/liveRooms/useCreateLiveRoom';
import { LiveRoomMode } from '../../../graphql/liveRooms';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import {
  ArrowIcon,
  CameraIcon,
  InfoIcon,
  MarkdownIcon,
  MaximizeIcon,
  MiniCloseIcon,
  MinimizeIcon,
  PlusIcon,
  VIcon,
} from '../../icons';
import { TruncateText } from '../../utilities';
import { SourceAvatar } from '../../profile/source';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../../dropdown/DropdownMenu';
import CloseButton from '../../CloseButton';
import { LogEvent } from '../../../lib/log';
import type { Squad } from '../../../graphql/sources';
import { SourceType } from '../../../graphql/sources';
import {
  uploadContentImage,
  imageSizeLimitMB,
  acceptedTypesList,
  ACCEPTED_TYPES,
  type CreatePostInMultipleSourcesArgs,
  type ExternalLinkPreview,
} from '../../../graphql/posts';
import { useFileInput } from '../../../hooks/utils/useFileInput';
import { isAppleDevice } from '../../../lib/func';
import { link as appLinks } from '../../../lib/links';
import { Tooltip } from '../../tooltip/Tooltip';
import { IconSize } from '../../Icon';
import { labels } from '../../../lib/labels';

const MAX_AUDIENCE_SQUADS = 3;
const MAX_TITLE_LENGTH = 250;
const MAX_BODY_LENGTH = 10_000;
const MAX_POLL_OPTIONS = 4;
const MIN_POLL_OPTIONS = 2;
const MAX_POLL_OPTION_LENGTH = 35;
const DEFAULT_POLL_DURATION_DAYS = 7;

const BODY_PLACEHOLDER = 'Share a link or write something...';
const TITLE_PLACEHOLDER = 'Post title...';
const POLL_QUESTION_PLACEHOLDER = 'Ask a question...';

const POLL_DURATION_OPTIONS: Array<{
  label: string;
  value: number | undefined;
}> = [
  { label: '1 day', value: 1 },
  { label: '3 days', value: 3 },
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
  { label: 'No end date', value: undefined },
];

export interface SmartComposerModalProps extends LazyModalCommonProps {
  initialUrl?: string;
  initialBody?: string;
  initialSquadHandle?: string;
  preview?: ExternalLinkPreview;
}

const buildEscalationParams = ({
  title,
  body,
  url,
  audience,
}: {
  title?: string;
  body: string;
  url?: string;
  audience?: Squad;
}): string => {
  const params = new URLSearchParams();
  if (audience?.handle) {
    params.set('sid', audience.handle);
  }
  if (title) {
    params.set('title', title);
  }
  if (body) {
    params.set('body', body);
  }
  if (url) {
    params.set('link', url);
  }
  if (url) {
    params.set('share', 'true');
  }
  return params.toString();
};

interface AudienceChipProps {
  selectedIds: string[];
  options: Squad[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

const isUserAudience = (squad: Squad | undefined): boolean =>
  (squad?.type as SourceType) === SourceType.User;

const AudienceAvatarStack = ({
  audiences,
}: {
  audiences: Squad[];
}): ReactElement | null => {
  const visible = audiences.slice(0, 3);
  if (visible.length === 0) {
    return null;
  }
  return (
    <span className="flex shrink-0 items-center -space-x-1">
      {visible.map((audience) => (
        <SourceAvatar
          key={audience.id}
          source={audience}
          size={ProfileImageSize.XSmall}
          className="!mr-0 ring-2 ring-background-default"
        />
      ))}
    </span>
  );
};

const AudienceChip = ({
  selectedIds,
  options,
  onChange,
  disabled,
}: AudienceChipProps): ReactElement | null => {
  const [open, setOpen] = useState(false);

  const selectedAudiences = useMemo(
    () =>
      options.filter(
        (option) => !!option.id && selectedIds.includes(option.id),
      ),
    [options, selectedIds],
  );
  const primary = selectedAudiences[0];

  if (!primary) {
    return null;
  }

  const isMulti = selectedAudiences.length > 1;
  const showChevron = options.length > 1 && !disabled;
  const triggerLabel = (() => {
    if (!isMulti) {
      return isUserAudience(primary) ? 'Everyone' : primary.name;
    }
    return `${selectedAudiences.length} audiences`;
  })();
  const showSingleAvatar = !isMulti && !isUserAudience(primary);

  const userOptionId = options.find(isUserAudience)?.id;
  const isEveryoneSelected =
    !!userOptionId && selectedIds.includes(userOptionId);
  const selectedSquadCount = selectedAudiences.filter(
    (audience) => !isUserAudience(audience),
  ).length;
  const isAtSquadLimit = selectedSquadCount >= MAX_AUDIENCE_SQUADS;

  const toggleOption = (option: Squad) => {
    const optionId = option.id;
    if (!optionId) {
      return;
    }

    if (isUserAudience(option)) {
      // Everyone toggles on/off independently of squads. When toggled
      // off it falls back to whatever squads are selected; if nothing
      // would remain selected we keep Everyone (last-resort floor).
      if (isEveryoneSelected) {
        if (selectedSquadCount === 0) {
          return;
        }
        onChange(selectedIds.filter((id) => id !== optionId));
        return;
      }
      onChange([...selectedIds, optionId]);
      return;
    }

    if (selectedIds.includes(optionId)) {
      const remaining = selectedIds.filter((id) => id !== optionId);
      if (remaining.length === 0) {
        onChange(userOptionId ? [userOptionId] : [optionId]);
        return;
      }
      onChange(remaining);
      return;
    }

    if (isAtSquadLimit) {
      return;
    }

    // Selecting the FIRST squad while only Everyone was selected —
    // Everyone gets unchecked by default (it was the placeholder).
    // Subsequent clicks add squads alongside.
    const isFirstSquadFromDefault =
      isEveryoneSelected && selectedSquadCount === 0;
    const baseIds = isFirstSquadFromDefault
      ? selectedIds.filter((id) => id !== userOptionId)
      : selectedIds;
    onChange([...baseIds, optionId]);
  };

  const handleReset = () => {
    if (userOptionId && !isEveryoneSelected) {
      onChange([userOptionId]);
    }
  };

  const canReset = !isEveryoneSelected || selectedSquadCount > 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={classNames(
            'flex max-w-full shrink-0 items-center gap-1.5 rounded-12 px-2.5 py-1 text-text-primary transition-colors typo-callout',
            !disabled && 'hover:bg-surface-float',
            disabled && 'cursor-default',
            open && !disabled && 'bg-surface-float',
          )}
          disabled={disabled || options.length <= 1}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={
            isMulti
              ? `Posting to ${selectedAudiences.length} audiences. Open audience menu.`
              : `Posting to ${triggerLabel}. Open audience menu.`
          }
        >
          {isMulti ? (
            <AudienceAvatarStack audiences={selectedAudiences} />
          ) : (
            showSingleAvatar && (
              <SourceAvatar source={primary} size={ProfileImageSize.XSmall} />
            )
          )}
          <TruncateText className="max-w-48 font-bold">
            {triggerLabel}
          </TruncateText>
          {showChevron && (
            <ArrowIcon
              className={classNames(
                'shrink-0 text-text-tertiary transition-transform',
                open ? 'rotate-0' : 'rotate-180',
              )}
              size={IconSize.Size16}
            />
          )}
        </button>
      </DropdownMenuTrigger>
      {showChevron && (
        <DropdownMenuContent
          align="start"
          variant="field"
          className={classNames(
            '!min-w-64 !max-w-72',
            isAtSquadLimit && '!pb-0',
          )}
          scrollableClassName=""
        >
          <div className="flex items-center justify-between gap-2 px-3 pb-1 pt-2">
            <span className="text-text-tertiary typo-caption2">Post to</span>
            <button
              type="button"
              onClick={handleReset}
              disabled={!canReset}
              className={classNames(
                'rounded-6 px-1 transition-colors typo-caption1',
                canReset
                  ? 'text-text-link hover:underline'
                  : 'cursor-default text-text-disabled',
              )}
            >
              Reset
            </button>
          </div>
          <div className="flex max-h-60 flex-col gap-px overflow-y-auto">
            {options.map((option) => {
              const optionLabel = isUserAudience(option)
                ? 'Everyone'
                : option.name;
              const isSelected = !!option.id && selectedIds.includes(option.id);
              const reachedLimit =
                !isSelected && !isUserAudience(option) && isAtSquadLimit;
              return (
                <DropdownMenuItem
                  key={option.id}
                  onSelect={(event) => {
                    event.preventDefault();
                    if (reachedLimit) {
                      return;
                    }
                    toggleOption(option);
                  }}
                  disabled={reachedLimit}
                  aria-checked={isSelected}
                  className="!h-9 gap-2 !overflow-visible !px-2"
                >
                  <SourceAvatar
                    source={option}
                    size={ProfileImageSize.XSmall}
                    className="!mr-0 shrink-0"
                  />
                  <span
                    className={classNames(
                      'min-w-0 flex-1 truncate text-left typo-callout',
                      isSelected ? 'font-bold text-text-primary' : '',
                      reachedLimit ? 'text-text-disabled' : '',
                    )}
                  >
                    {optionLabel}
                  </span>
                  <span
                    aria-hidden
                    className="flex size-4 shrink-0 items-center justify-center"
                  >
                    {isSelected && (
                      <VIcon
                        secondary
                        size={IconSize.Size16}
                        className="text-accent-cabbage-default"
                      />
                    )}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </div>
          {isAtSquadLimit && (
            <div className="flex items-center gap-2 border-t border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-secondary typo-caption1">
              <InfoIcon
                size={IconSize.Size16}
                secondary
                className="shrink-0 text-status-info"
              />
              <span className="font-bold">
                You can post to up to {MAX_AUDIENCE_SQUADS} squads
              </span>
            </div>
          )}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

interface FullEditorBannerProps {
  onEscalate: () => void;
  onDismiss: () => void;
}

const FullEditorBanner = ({
  onEscalate,
  onDismiss,
}: FullEditorBannerProps): ReactElement => (
  <div className="flex w-full shrink-0 items-center justify-between gap-2 bg-background-subtle px-5 py-1.5 typo-caption2 tablet:rounded-b-16">
    <button
      type="button"
      onClick={onEscalate}
      className="text-left text-text-tertiary transition-colors hover:text-text-link hover:underline"
    >
      I want to see the previous editor
    </button>
    <button
      type="button"
      onClick={onDismiss}
      aria-label="Dismiss editor switch banner"
      className="rounded -mr-1 flex size-5 shrink-0 items-center justify-center text-text-tertiary transition-colors hover:bg-surface-float hover:text-text-primary"
    >
      <MiniCloseIcon size={IconSize.Size16} />
    </button>
  </div>
);

const SpamWarningBanner = (): ReactElement => (
  <div className="bg-status-warning/10 flex w-full shrink-0 items-center gap-2 px-5 py-1.5 text-text-secondary typo-caption2">
    <InfoIcon
      size={IconSize.Size16}
      secondary
      className="shrink-0 text-status-warning"
    />
    <span>{labels.postCreation.warnings.spammyPosts}</span>
  </div>
);

interface PollOptionsEditorProps {
  options: string[];
  onChange: (options: string[]) => void;
}

const PollOptionsEditor = ({
  options,
  onChange,
}: PollOptionsEditorProps): ReactElement => {
  const updateOption = useCallback(
    (index: number, value: string) => {
      const next = [...options];
      next[index] = value;
      onChange(next);
    },
    [options, onChange],
  );

  const removeOption = useCallback(
    (index: number) => {
      if (options.length <= MIN_POLL_OPTIONS) {
        return;
      }
      onChange(options.filter((_, i) => i !== index));
    },
    [options, onChange],
  );

  const addOption = useCallback(() => {
    if (options.length >= MAX_POLL_OPTIONS) {
      return;
    }
    onChange([...options, '']);
  }, [options, onChange]);

  return (
    <div className="flex flex-col gap-2">
      {options.map((option, index) => {
        const canRemove = options.length > MIN_POLL_OPTIONS;
        const placeholder = `Option ${index + 1}${
          index < MIN_POLL_OPTIONS ? '' : ' (optional)'
        }`;
        return (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="flex items-center gap-2 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 transition-colors focus-within:border-border-subtlest-primary"
          >
            <span className="text-text-tertiary typo-callout">
              {index + 1}.
            </span>
            <input
              type="text"
              value={option}
              maxLength={MAX_POLL_OPTION_LENGTH}
              placeholder={placeholder}
              onChange={(e) => updateOption(index, e.currentTarget.value)}
              className="flex-1 bg-transparent text-text-primary outline-none typo-callout placeholder:text-text-quaternary"
              aria-label={`Poll option ${index + 1}`}
            />
            <span className="text-text-quaternary typo-caption2">
              {MAX_POLL_OPTION_LENGTH - option.length}
            </span>
            {canRemove && (
              <Tooltip content="Remove option">
                <Button
                  type="button"
                  size={ButtonSize.XSmall}
                  variant={ButtonVariant.Tertiary}
                  icon={<MiniCloseIcon size={IconSize.Size16} />}
                  onClick={() => removeOption(index)}
                  aria-label={`Remove option ${index + 1}`}
                />
              </Tooltip>
            )}
          </div>
        );
      })}
      {options.length < MAX_POLL_OPTIONS && (
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Subtle}
          icon={<PlusIcon />}
          onClick={addOption}
          className="self-start"
        >
          Add option
        </Button>
      )}
    </div>
  );
};

interface PollDurationSelectProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

const PollDurationSelect = ({
  value,
  onChange,
}: PollDurationSelectProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const selected =
    POLL_DURATION_OPTIONS.find((opt) => opt.value === value) ??
    POLL_DURATION_OPTIONS[2];

  return (
    <div className="flex items-center gap-2">
      <span className="text-text-tertiary typo-callout">Poll closes after</span>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            className="!justify-between !rounded-12 !border !border-border-subtlest-tertiary !px-3 !font-normal !typo-callout"
          >
            {selected.label}
            <ArrowIcon
              className="ml-2 rotate-180 text-text-tertiary"
              secondary
              size={IconSize.Size16}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" variant="field" className="min-w-44">
          <DropdownMenuOptions
            options={POLL_DURATION_OPTIONS.map((opt) => ({
              label: opt.label,
              action: () => {
                onChange(opt.value);
                setOpen(false);
              },
            }))}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const useSubmitShortcutLabel = () => {
  const [label, setLabel] = useState('Ctrl + Enter');
  useEffect(() => {
    setLabel(isAppleDevice() ? '⌘ + Enter' : 'Ctrl + Enter');
  }, []);
  return label;
};

interface CoverImageDisplayProps {
  src: string;
  onRemove: () => void;
  onReplace?: () => void;
  isUploading?: boolean;
}

const ConditionalImageWrapper = ({
  onReplace,
  children,
}: {
  onReplace?: () => void;
  children: ReactElement;
}): ReactElement => {
  if (!onReplace) {
    return children;
  }
  return (
    <button
      type="button"
      onClick={onReplace}
      aria-label="Replace cover image"
      className="block w-full overflow-hidden rounded-16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default"
    >
      {children}
    </button>
  );
};

const AttachmentRemoveButton = ({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}): ReactElement => (
  <Tooltip content={label}>
    <Button
      type="button"
      size={ButtonSize.Small}
      variant={ButtonVariant.Primary}
      icon={<MiniCloseIcon />}
      onClick={onClick}
      aria-label={label}
      className="absolute right-3 top-3 z-1 !rounded-full !bg-surface-invert !text-text-primary !shadow-3 hover:!bg-text-primary hover:!text-surface-invert"
    />
  </Tooltip>
);

const CoverImageDisplay = ({
  src,
  onRemove,
  onReplace,
  isUploading,
}: CoverImageDisplayProps): ReactElement => (
  <div className="group relative">
    <ConditionalImageWrapper onReplace={onReplace}>
      <img
        src={src}
        alt="Post cover"
        className={classNames(
          'block aspect-[2/1] w-full rounded-16 object-cover transition-opacity',
          'group-hover:brightness-95',
          isUploading && 'opacity-50',
        )}
      />
    </ConditionalImageWrapper>
    <AttachmentRemoveButton onClick={onRemove} label="Remove image" />
  </div>
);

export function SmartComposerModal({
  onRequestClose,
  initialUrl,
  initialBody,
  initialSquadHandle,
  preview: initialPreview,
  ...props
}: SmartComposerModalProps): ReactElement {
  const router = useRouter();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const richTextRef = useRef<RichTextInputRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const submitShortcut = useSubmitShortcutLabel();
  const titleStartedRef = useRef(false);
  const bodyStartedRef = useRef(false);

  const seedBody = useMemo(() => {
    if (initialBody) {
      return initialBody;
    }
    if (initialUrl) {
      return initialUrl;
    }
    return '';
  }, [initialBody, initialUrl]);

  const [body, setBody] = useState(seedBody);
  const [title, setTitle] = useState('');
  const [titleManuallyEdited, setTitleManuallyEdited] = useState(false);
  const [titleExpanded, setTitleExpanded] = useState(false);
  const [coverImage, setCoverImage] = useState<{
    base64: string;
    file?: File;
    uploadedUrl?: string;
  } | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [selectedAudienceIds, setSelectedAudienceIds] = useState<string[]>([]);
  const [dismissedPreviewUrl, setDismissedPreviewUrl] = useState<string | null>(
    null,
  );
  const [isFullEditorBannerDismissed, setIsFullEditorBannerDismissed] =
    useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMarkdownEditorMode, setIsMarkdownEditorMode] = useState(false);
  const [kind, setKind] = useState<ComposerKind>('text');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollDuration, setPollDuration] = useState<number | undefined>(
    DEFAULT_POLL_DURATION_DAYS,
  );
  const [standupConfig, setStandupConfig] = useState<StandupConfig>(
    DEFAULT_STANDUP_CONFIG,
  );

  const isPollMode = kind === 'poll';
  const isStandupMode = kind === 'standup';
  const variant = getComposerVariant(kind);

  const { mutateAsync: createLiveRoom, isPending: isCreatingStandup } =
    useCreateLiveRoom();

  const {
    mode,
    detectedUrl,
    audienceOptions,
    defaultAudience,
    rememberAudience,
  } = useSmartComposer({
    body,
    isTitleManuallyEdited: titleManuallyEdited,
    initialSquadHandle,
  });

  // Hydrate the multi-select with the inferred default audience once it's
  // resolved. Subsequent user toggles take over.
  useEffect(() => {
    if (selectedAudienceIds.length > 0) {
      return;
    }
    if (defaultAudience?.id) {
      setSelectedAudienceIds([defaultAudience.id]);
    }
  }, [defaultAudience?.id, selectedAudienceIds.length]);

  const selectedAudiences = useMemo(
    () =>
      audienceOptions.filter(
        (option) => !!option.id && selectedAudienceIds.includes(option.id),
      ),
    [audienceOptions, selectedAudienceIds],
  );
  const audience = selectedAudiences[0] ?? defaultAudience;
  const isMultiMode = selectedAudiences.length > 1;
  const selectedSquadCountTopLevel = selectedAudiences.filter(
    (selected) => !isUserAudience(selected),
  ).length;
  const showSpamWarningBanner = selectedSquadCountTopLevel > 1;
  const previousModeRef = useRef<SmartComposerMode>(mode);
  const hasLoggedOpenRef = useRef(false);

  useEffect(() => {
    if (hasLoggedOpenRef.current) {
      return;
    }
    hasLoggedOpenRef.current = true;
    logEvent({
      event_name: LogEvent.OpenSmartComposer,
      extra: JSON.stringify({ mode, hasInitialUrl: !!initialUrl }),
    });
  }, [logEvent, mode, initialUrl]);

  useEffect(() => {
    if (previousModeRef.current === mode) {
      return;
    }
    previousModeRef.current = mode;
    logEvent({
      event_name: LogEvent.OpenSmartComposer,
      target_id: mode,
      extra: JSON.stringify({ inferred: true }),
    });
  }, [logEvent, mode]);

  const isFreeform = mode === 'freeform';
  const submissionMode: 'freeform' | 'share' | 'poll' = isPollMode
    ? 'poll'
    : mode;

  const completeSubmit = useCallback(() => {
    logEvent({
      event_name: LogEvent.SubmitSmartComposer,
      target_id: submissionMode,
    });
    if (audience?.id && !isMultiMode) {
      rememberAudience(audience.id);
    }
    onRequestClose?.();
  }, [
    audience?.id,
    isMultiMode,
    logEvent,
    onRequestClose,
    rememberAudience,
    submissionMode,
  ]);

  const onPostSuccess = useCallback(() => {
    if (submissionMode === 'freeform') {
      displayToast('✅ Your post has been created!');
    } else if (submissionMode === 'poll') {
      displayToast('✅ Your poll is live!');
    }
    completeSubmit();
  }, [completeSubmit, displayToast, submissionMode]);

  const onModerationSuccess = useCallback(() => {
    displayToast('✅ Your post has been submitted for moderation');
    completeSubmit();
  }, [completeSubmit, displayToast]);

  const {
    getLinkPreview,
    isLoadingPreview,
    preview,
    isPosting,
    onSubmitFreeformPost,
    onSubmitPollPost,
    onSubmitPost,
    onUpdatePreview,
  } = usePostToSquad({
    initialPreview,
    onPostSuccess,
    onSourcePostModerationSuccess: onModerationSuccess,
    getSharedPostSuccessToast: ({ isUpdate }) => ({
      message: isUpdate
        ? 'The post has been updated'
        : '✅ Your post has been shared',
    }),
  });

  const { onCreate: onCreateMultiSourcePost, isPending: isMultiPosting } =
    useMultipleSourcePost({
      onSuccess: () => {
        if (submissionMode === 'poll') {
          displayToast('✅ Your poll is live!');
        } else if (submissionMode === 'freeform') {
          displayToast('✅ Your post has been created!');
        } else {
          displayToast('✅ Your post has been shared');
        }
        completeSubmit();
      },
      onError: () => {
        displayToast('Failed to publish to one or more squads');
      },
    });

  useEffect(() => {
    if (mode !== 'share') {
      return;
    }
    if (titleManuallyEdited) {
      return;
    }
    if (!preview?.title) {
      return;
    }
    setTitle(preview.title);
  }, [mode, preview?.title, titleManuallyEdited]);

  useEffect(() => {
    if (mode === 'freeform') {
      titleInputRef.current?.focus();
    }
  }, [mode]);

  useEffect(() => {
    if (titleExpanded) {
      titleInputRef.current?.focus();
    }
  }, [titleExpanded]);

  useEffect(() => {
    if (isPollMode) {
      titleInputRef.current?.focus();
    }
  }, [isPollMode]);

  const fetchPreview = useCallback(
    (value?: string) => {
      if (!value) {
        return;
      }
      getLinkPreview(value).catch(() => {
        // surfaced via usePostToSquad's toast handler
      });
    },
    [getLinkPreview],
  );

  const [checkUrl] = useDebouncedUrl(fetchPreview, (value) => {
    if (!value) {
      return false;
    }
    if (!preview) {
      return true;
    }
    return preview.url !== value && preview.permalink !== value;
  });

  useEffect(() => {
    if (!detectedUrl) {
      // Clear preview when URL is removed from body
      if (preview?.url) {
        onUpdatePreview({});
      }
      return;
    }
    checkUrl(detectedUrl.url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detectedUrl?.url]);

  const handleEscalate = useCallback(() => {
    logEvent({
      event_name: LogEvent.EscalateSmartComposer,
      target_id: 'full',
    });
    const search = buildEscalationParams({
      title: title.trim() || undefined,
      body,
      url: detectedUrl?.url,
      audience,
    });
    const target = `${appLinks.post.create}${search ? `?${search}` : ''}`;
    router.push(target);
    onRequestClose?.();
  }, [
    audience,
    body,
    detectedUrl?.url,
    logEvent,
    onRequestClose,
    router,
    title,
  ]);

  const handleClose = useCallback(
    (e?: React.MouseEvent | React.KeyboardEvent) => {
      logEvent({
        event_name: LogEvent.DismissSmartComposer,
        target_id: submissionMode,
      });
      onRequestClose?.(e);
    },
    [logEvent, onRequestClose, submissionMode],
  );

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      logEvent({
        event_name: LogEvent.ExpandSmartComposer,
        target_id: next ? 'expanded' : 'collapsed',
      });
      return next;
    });
  }, [logEvent]);

  const handleKindChange = useCallback(
    (next: ComposerKind) => {
      setKind((prev) => {
        if (prev === next) {
          return prev;
        }
        logEvent({
          event_name: LogEvent.ToggleModeSmartComposer,
          target_id: next,
        });
        return next;
      });
    },
    [logEvent],
  );

  const handleAudienceChange = useCallback(
    (ids: string[]) => {
      setSelectedAudienceIds(ids);
      logEvent({
        event_name: LogEvent.ChangeAudienceSmartComposer,
        target_id: ids.length > 1 ? 'multi' : 'single',
        extra: JSON.stringify({ count: ids.length }),
      });
    },
    [logEvent],
  );

  const adjustTitleHeight = useCallback(() => {
    const node = titleInputRef.current;
    if (!node) {
      return;
    }
    node.style.height = 'auto';
    node.style.height = `${node.scrollHeight}px`;
  }, []);

  useEffect(() => {
    adjustTitleHeight();
  }, [title, adjustTitleHeight]);

  const onTitleChange = useCallback(
    (event: React.FormEvent<HTMLTextAreaElement>) => {
      const value = event.currentTarget.value.replace(/\n/g, '');
      setTitle(value);
      setTitleManuallyEdited(true);
      if (!titleStartedRef.current && value.length > 0) {
        titleStartedRef.current = true;
        logEvent({ event_name: LogEvent.StartTitleSmartComposer });
      }
    },
    [logEvent],
  );

  const onTitleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        const { form } = event.currentTarget;
        form?.requestSubmit();
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        richTextRef.current?.focus();
      }
    },
    [],
  );

  const onCoverFileChange = useCallback(
    (file?: File) => {
      if (!file) {
        setCoverImage(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCoverImage({ base64: reader.result as string, file });
      };
      reader.readAsDataURL(file);
      logEvent({
        event_name: LogEvent.AttachCoverSmartComposer,
        extra: JSON.stringify({ size: file.size, type: file.type }),
      });
    },
    [logEvent],
  );

  const { onFileChange: handleFile } = useFileInput({
    acceptedTypes: acceptedTypesList,
    limitMb: imageSizeLimitMB,
    onChange: (_, file) => onCoverFileChange(file),
  });

  const onFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      handleFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFile],
  );

  const removeCover = useCallback(() => {
    setCoverImage(null);
  }, []);

  const validPollOptions = useMemo(
    () => pollOptions.map((opt) => opt.trim()).filter(Boolean),
    [pollOptions],
  );

  const composerState: ComposerState = useMemo(
    () => ({
      kind,
      title,
      body,
      coverImage: coverImage
        ? {
            url: coverImage.uploadedUrl ?? '',
            ...(coverImage.file ? { file: coverImage.file } : {}),
          }
        : null,
      preview,
      detectedUrl,
      pollOptions,
      pollDurationDays: pollDuration,
      standup: standupConfig,
    }),
    [
      body,
      coverImage,
      detectedUrl,
      kind,
      pollDuration,
      pollOptions,
      preview,
      standupConfig,
      title,
    ],
  );

  const variantValidation = variant.validate(composerState);

  // Standup is a global event (not posted to a squad), so it skips the
  // audience requirement that gates other variants.
  const audienceRequired = !isStandupMode;
  const isSubmitDisabled =
    isPosting ||
    isUploadingCover ||
    isMultiPosting ||
    isCreatingStandup ||
    (audienceRequired && selectedAudienceIds.length === 0) ||
    !variantValidation.isValid;

  const ensureCoverUrl = useCallback(async (): Promise<string | undefined> => {
    if (!coverImage?.file) {
      return coverImage?.uploadedUrl;
    }
    if (coverImage.uploadedUrl) {
      return coverImage.uploadedUrl;
    }
    try {
      setIsUploadingCover(true);
      const uploaded = await uploadContentImage(coverImage.file);
      setCoverImage((prev) =>
        prev ? { ...prev, uploadedUrl: uploaded } : prev,
      );
      return uploaded;
    } catch (error) {
      displayToast(
        error instanceof Error ? error.message : 'Failed to upload cover image',
      );
      return undefined;
    } finally {
      setIsUploadingCover(false);
    }
  }, [coverImage, displayToast]);

  const submit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmitDisabled) {
        return;
      }

      if (isStandupMode) {
        try {
          const joinToken = await createLiveRoom({
            topic: standupConfig.topic.trim(),
            mode: standupConfig.mode,
            speakerLimit:
              standupConfig.mode === LiveRoomMode.FreeForAll
                ? standupConfig.speakerLimit
                : undefined,
          });
          logEvent({
            event_name: LogEvent.SubmitSmartComposer,
            target_id: 'standup',
          });
          onRequestClose?.();
          router.push(`/standups/${joinToken.room.id}`);
        } catch (error) {
          displayToast(
            error instanceof Error ? error.message : 'Failed to start standup',
          );
        }
        return;
      }

      // Multi-audience branch — drives every mode through
      // createPostInMultipleSources. The args type marks `options` as
      // required (for polls), but the API ignores it for non-poll modes,
      // mirroring what /squads/create does at submit time.
      if (isMultiMode && selectedAudienceIds.length > 0) {
        if (isPollMode) {
          await onCreateMultiSourcePost({
            sourceIds: selectedAudienceIds,
            title: title.trim(),
            options: validPollOptions.map((text, order) => ({ text, order })),
            ...(pollDuration != null ? { duration: pollDuration } : {}),
          } as unknown as CreatePostInMultipleSourcesArgs);
          return;
        }

        if (isFreeform) {
          await onCreateMultiSourcePost({
            sourceIds: selectedAudienceIds,
            title: title.trim(),
            content: body,
            ...(coverImage?.file ? { image: coverImage.file } : {}),
          } as unknown as CreatePostInMultipleSourcesArgs);
          return;
        }

        const coverUrl = await ensureCoverUrl();
        const url = preview?.finalUrl ?? preview?.url ?? detectedUrl?.url;
        const customTitle = title.trim();
        const cleanedBody = cleanShareCommentary(body, url);

        if (preview?.id) {
          await onCreateMultiSourcePost({
            sourceIds: selectedAudienceIds,
            sharedPostId: preview.id,
            commentary: cleanedBody,
            ...(customTitle ? { title: customTitle } : {}),
          } as unknown as CreatePostInMultipleSourcesArgs);
          return;
        }

        if (!url || !(customTitle || preview?.title)) {
          displayToast('Invalid link');
          return;
        }

        await onCreateMultiSourcePost({
          sourceIds: selectedAudienceIds,
          externalLink: url,
          title: customTitle || preview?.title,
          imageUrl: coverUrl ?? preview?.image,
          commentary: cleanedBody,
        } as unknown as CreatePostInMultipleSourcesArgs);
        return;
      }

      if (!audience) {
        return;
      }

      if (isPollMode) {
        await onSubmitPollPost(
          {
            title: title.trim(),
            options: validPollOptions,
            duration: pollDuration,
          },
          audience,
        );
        return;
      }

      if (isFreeform) {
        await onSubmitFreeformPost(
          {
            title: title.trim(),
            content: body,
            ...(coverImage?.file ? { image: coverImage.file } : {}),
          },
          audience,
        );
        return;
      }

      // Share single-squad path: keep existing behaviour (upload cover, then submit).
      const coverUrl = await ensureCoverUrl();
      if (coverImage?.file && !coverUrl) {
        return;
      }
      if (coverUrl) {
        onUpdatePreview({ ...preview, image: coverUrl });
      }

      const customTitle = title.trim();
      if (customTitle && customTitle !== preview?.title) {
        onUpdatePreview({
          ...preview,
          ...(coverUrl ? { image: coverUrl } : {}),
          title: customTitle,
        });
      }

      const shareUrl = preview?.finalUrl ?? preview?.url ?? detectedUrl?.url;
      const cleanedBody = cleanShareCommentary(body, shareUrl);
      await onSubmitPost(event, audience, cleanedBody);
    },
    [
      audience,
      body,
      coverImage,
      createLiveRoom,
      detectedUrl?.url,
      displayToast,
      ensureCoverUrl,
      isFreeform,
      isMultiMode,
      isPollMode,
      isStandupMode,
      isSubmitDisabled,
      logEvent,
      onCreateMultiSourcePost,
      onRequestClose,
      onSubmitFreeformPost,
      onSubmitPollPost,
      onSubmitPost,
      onUpdatePreview,
      pollDuration,
      preview,
      router,
      selectedAudienceIds,
      standupConfig,
      title,
      validPollOptions,
    ],
  );

  const renderTitleField = () => {
    const showInline =
      isPollMode ||
      isFreeform ||
      titleExpanded ||
      (mode === 'share' && titleManuallyEdited);

    if (!showInline && mode === 'share' && preview?.title) {
      return (
        <div className="flex items-center gap-2 px-1 text-text-tertiary typo-footnote">
          <span className="truncate">Auto: {preview.title}</span>
          <button
            type="button"
            className="font-bold text-text-link hover:underline"
            onClick={() => setTitleExpanded(true)}
          >
            Edit title
          </button>
        </div>
      );
    }

    if (!showInline) {
      return null;
    }

    const placeholder = isPollMode
      ? POLL_QUESTION_PLACEHOLDER
      : TITLE_PLACEHOLDER;

    return (
      <textarea
        ref={titleInputRef}
        name="title"
        value={title}
        onChange={onTitleChange}
        onKeyDown={onTitleKeyDown}
        placeholder={placeholder}
        maxLength={MAX_TITLE_LENGTH}
        rows={1}
        className="w-full resize-none overflow-hidden break-words bg-transparent font-bold leading-tight text-text-primary outline-none typo-title2 placeholder:text-text-quaternary"
        aria-label={isPollMode ? 'Poll question' : 'Post title'}
      />
    );
  };

  const onBodyValueUpdate = useCallback(
    (value: string) => {
      setBody(value);
      if (!bodyStartedRef.current && value.trim().length > 0) {
        bodyStartedRef.current = true;
        logEvent({ event_name: LogEvent.StartBodySmartComposer });
      }
    },
    [logEvent],
  );

  const onBodySubmit = useCallback(() => {
    const form = document.getElementById('smart-composer-form');
    if (form instanceof HTMLFormElement) {
      form.requestSubmit();
    }
  }, []);

  const showPreviewArea =
    !!detectedUrl &&
    !coverImage &&
    !isPollMode &&
    detectedUrl.url !== dismissedPreviewUrl;
  const showCoverArea = !!coverImage && !isPollMode;

  const dismissPreview = useCallback(() => {
    if (detectedUrl) {
      setDismissedPreviewUrl(detectedUrl.url);
    }
  }, [detectedUrl]);

  const bodyPlaceholder = (() => {
    if (coverImage) {
      return 'Add a caption to go with your image (optional)...';
    }
    return BODY_PLACEHOLDER;
  })();

  const fullEditorBanner = isFullEditorBannerDismissed ? null : (
    <FullEditorBanner
      onEscalate={handleEscalate}
      onDismiss={() => setIsFullEditorBannerDismissed(true)}
    />
  );

  const handleToggleMarkdownMode = useCallback(() => {
    richTextRef.current?.toggleMarkdownMode();
  }, []);

  const markdownToggleButton = (
    <Tooltip
      content={
        isMarkdownEditorMode ? 'Switch to rich text' : 'Switch to Markdown'
      }
    >
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        icon={<MarkdownIcon secondary={isMarkdownEditorMode} />}
        pressed={isMarkdownEditorMode}
        onClick={handleToggleMarkdownMode}
        aria-label={
          isMarkdownEditorMode ? 'Switch to rich text' : 'Switch to Markdown'
        }
        aria-pressed={isMarkdownEditorMode}
      />
    </Tooltip>
  );

  const coverImagePlaceholder = !isPollMode && !coverImage && (
    <div className="px-5 pb-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-12 border border-dashed border-border-subtlest-tertiary px-3 py-1.5 text-text-tertiary transition-colors typo-callout hover:border-border-subtlest-secondary hover:bg-surface-float hover:text-text-primary"
        aria-label="Add a cover image"
      >
        <CameraIcon size={IconSize.Size16} />
        Add cover
      </button>
    </div>
  );

  // Poll/Standup are picked from KindTabs at the top of the modal so the
  // formatting toolbar stays focused on text-formatting actions only.
  const inlineExtraActions = null;

  const submitLabel = variant.submitLabel(composerState);
  const postButton = (
    <Tooltip content={`${submitLabel} (${submitShortcut})`}>
      <Button
        type="submit"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        disabled={isSubmitDisabled}
        loading={isPosting || isUploadingCover || isMultiPosting}
        className="ml-2 px-5"
      >
        {submitLabel}
      </Button>
    </Tooltip>
  );

  const coverImageBlock = showCoverArea ? (
    <div className="shrink-0 px-5 pb-3">
      <CoverImageDisplay
        src={coverImage.base64}
        onRemove={removeCover}
        onReplace={() => fileInputRef.current?.click()}
        isUploading={isUploadingCover}
      />
    </div>
  ) : null;

  const linkPreviewBlock = showPreviewArea ? (
    <div className="px-5 pb-2">
      <div className="animate-fade-in relative">
        {isLoadingPreview && <WritePreviewSkeleton link={detectedUrl.url} />}
        {!isLoadingPreview && preview?.title && (
          <WriteLinkPreview
            preview={preview}
            link={detectedUrl.url}
            showPreviewLink={false}
          />
        )}
        <AttachmentRemoveButton
          onClick={dismissPreview}
          label="Remove link preview"
        />
      </div>
    </div>
  ) : null;

  return (
    <Modal
      kind={ModalKind.FlexibleTop}
      size={isExpanded ? ModalSize.XLarge : ModalSize.Medium}
      onRequestClose={handleClose}
      isDrawerOnMobile={!isLaptop}
      shouldCloseOnOverlayClick={false}
      overlayClassName={isExpanded ? '!pt-0' : 'tablet:!pt-16 laptop:!pt-12'}
      className={classNames(
        'flex flex-col',
        isExpanded
          ? '!mb-0 !mt-0 !h-[100vh] !max-h-[100vh] !w-[100vw] !max-w-[100vw] !rounded-none'
          : '!min-h-[30.5rem] !max-w-[48.75rem] tablet:!max-h-[calc(100vh-7rem)] tablet:w-[48.75rem] laptop:!max-h-[calc(100vh-6rem)]',
      )}
      {...props}
    >
      <form
        id="smart-composer-form"
        onSubmit={submit}
        className={classNames(
          'flex h-full min-h-0 w-full flex-col overflow-hidden',
          isExpanded ? 'mx-auto max-w-[58rem]' : '',
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-2 px-5 pb-2 pt-5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {user && (
              <ProfilePicture
                user={user}
                size={ProfileImageSize.Medium}
                nativeLazyLoading
              />
            )}
            {!isStandupMode && (
              <AudienceChip
                selectedIds={selectedAudienceIds}
                options={audienceOptions}
                onChange={handleAudienceChange}
              />
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {!isPollMode && !isStandupMode && markdownToggleButton}
            <Tooltip
              content={isExpanded ? 'Collapse composer' : 'Expand composer'}
            >
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
                icon={
                  isExpanded ? (
                    <MinimizeIcon size={IconSize.Size16} />
                  ) : (
                    <MaximizeIcon size={IconSize.Size16} />
                  )
                }
                onClick={handleToggleExpanded}
                aria-label={
                  isExpanded ? 'Collapse composer' : 'Expand composer'
                }
                aria-pressed={isExpanded}
              />
            </Tooltip>
            <CloseButton
              type="button"
              size={ButtonSize.Small}
              onClick={(e) => handleClose(e)}
              aria-label="Close composer"
            />
          </div>
        </div>

        {showSpamWarningBanner && <SpamWarningBanner />}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {!isStandupMode && (
            <div className="shrink-0 px-5 pb-3 pt-2">{renderTitleField()}</div>
          )}

          {!isPollMode && !isStandupMode && mode !== 'share' && coverImageBlock}
          {!isPollMode &&
            !isStandupMode &&
            mode !== 'share' &&
            !showCoverArea &&
            coverImagePlaceholder}

          {isStandupMode && (
            <StandupBody config={standupConfig} onChange={setStandupConfig} />
          )}

          {!isStandupMode && isPollMode && (
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-3 pt-1">
              <PollOptionsEditor
                options={pollOptions}
                onChange={setPollOptions}
              />
              <PollDurationSelect
                value={pollDuration}
                onChange={setPollDuration}
              />
            </div>
          )}

          {!isStandupMode && !isPollMode && (
            <RichTextInput
              ref={richTextRef}
              initialContent={body || seedBody}
              onValueUpdate={onBodyValueUpdate}
              onSubmit={onBodySubmit}
              textareaProps={{
                placeholder: bodyPlaceholder,
                name: 'content',
              }}
              enabledCommand={{
                upload: true,
                mention: true,
                emoji: true,
                gif: true,
              }}
              maxInputLength={MAX_BODY_LENGTH}
              allowBlockFormatting
              minHeightClassName={isExpanded ? 'min-h-0' : 'min-h-[8rem]'}
              toolbarPosition="bottom"
              hideFooter
              hideMarkdownToggle
              hideMarkdownHeader
              onMarkdownModeChange={setIsMarkdownEditorMode}
              extraInlineActions={inlineExtraActions}
              inlineActionsLeading={
                isMarkdownEditorMode ? null : (
                  <KindModePicker
                    kind={kind}
                    onKindChange={handleKindChange}
                    disabled={isPosting || isUploadingCover || isMultiPosting}
                  />
                )
              }
              aboveToolbar={isMarkdownEditorMode ? null : linkPreviewBlock}
              toolbarRightActions={isMarkdownEditorMode ? null : postButton}
              className={{
                container: '!min-h-0 !flex-1 !rounded-none !bg-transparent',
                input: classNames(
                  '!px-5 !pt-3',
                  isMarkdownEditorMode && 'font-mono',
                ),
              }}
            />
          )}

          {(isPollMode || isStandupMode || isMarkdownEditorMode) && (
            <div className="flex shrink-0 items-center justify-between gap-3 px-5 pb-5 pt-2">
              <KindModePicker
                kind={kind}
                onKindChange={handleKindChange}
                disabled={isPosting || isUploadingCover || isMultiPosting}
              />
              {postButton}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            className="hidden"
            onChange={onFileInputChange}
          />
        </div>
        {fullEditorBanner}
      </form>
    </Modal>
  );
}

export default SmartComposerModal;
