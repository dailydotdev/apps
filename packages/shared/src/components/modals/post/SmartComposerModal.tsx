import type { FormEvent, ReactElement, KeyboardEvent, SVGProps } from 'react';
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
  type SmartComposerMode,
} from '../../../hooks/post/useSmartComposer';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import {
  ArrowIcon,
  CameraIcon,
  EditIcon,
  MenuIcon,
  MiniCloseIcon,
  OpenLinkIcon,
  PlusIcon,
  PollIcon,
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

const ExpandSvg = (props: SVGProps<SVGSVGElement>): ReactElement => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    {...props}
  >
    <path
      d="M3 8V3h5M17 8V3h-5M3 12v5h5M17 12v5h-5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CollapseSvg = (props: SVGProps<SVGSVGElement>): ReactElement => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    {...props}
  >
    <path
      d="M8 3v5H3M12 3v5h5M8 17v-5H3M12 17v-5h5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface AudienceChipProps {
  selectedIds: string[];
  options: Squad[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

const isUserAudience = (squad: Squad | undefined): boolean =>
  (squad?.type as SourceType) === SourceType.User;

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

  const primaryLabel = isUserAudience(primary) ? 'Everyone' : primary.name;
  const remaining = selectedAudiences.length - 1;
  const label = remaining > 0 ? `${primaryLabel} +${remaining}` : primaryLabel;
  const showChevron = options.length > 1 && !disabled;
  const showAvatar = !isUserAudience(primary) && selectedAudiences.length === 1;

  const toggleOption = (option: Squad) => {
    const optionId = option.id;
    if (!optionId) {
      return;
    }
    if (selectedIds.includes(optionId)) {
      if (selectedIds.length === 1) {
        return;
      }
      onChange(selectedIds.filter((id) => id !== optionId));
      return;
    }
    onChange([...selectedIds, optionId]);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={classNames(
            'flex max-w-full items-center gap-1.5 rounded-12 bg-surface-float px-2.5 py-1 text-text-primary transition-colors typo-callout',
            !disabled && 'hover:bg-surface-hover',
            disabled && 'cursor-default',
          )}
          disabled={disabled || options.length <= 1}
          aria-label={`Posting to ${label}. Open audience menu.`}
        >
          {showAvatar && (
            <SourceAvatar source={primary} size={ProfileImageSize.Small} />
          )}
          <TruncateText className="max-w-48 font-bold">{label}</TruncateText>
          {showChevron && (
            <ArrowIcon
              className={classNames(
                'text-text-tertiary transition-transform',
                open ? 'rotate-0' : 'rotate-180',
              )}
            />
          )}
        </button>
      </DropdownMenuTrigger>
      {showChevron && (
        <DropdownMenuContent align="start" variant="field" className="min-w-72">
          <div className="px-3 pb-1 pt-2 text-text-tertiary typo-caption1">
            Post to (select one or more)
          </div>
          {options.map((option) => {
            const optionLabel = isUserAudience(option)
              ? 'Everyone'
              : option.name;
            const isSelected = !!option.id && selectedIds.includes(option.id);
            const isLastSelected = isSelected && selectedIds.length === 1;
            return (
              <DropdownMenuItem
                key={option.id}
                onSelect={(event) => {
                  event.preventDefault();
                  toggleOption(option);
                }}
                disabled={isLastSelected}
                className="flex items-center gap-2"
              >
                <SourceAvatar source={option} size={ProfileImageSize.Small} />
                <TruncateText
                  className={classNames(
                    'flex-1',
                    isSelected ? 'font-bold' : '',
                  )}
                >
                  {optionLabel}
                </TruncateText>
                <span
                  aria-hidden
                  className={classNames(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-6 border-2',
                    isSelected
                      ? 'border-accent-cabbage-default bg-accent-cabbage-default'
                      : 'border-border-subtlest-primary',
                  )}
                >
                  {isSelected && (
                    <VIcon
                      secondary
                      size={IconSize.Size16}
                      className="text-white"
                    />
                  )}
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

interface MoreMenuProps {
  onEscalate: () => void;
  onAddCoverImage?: () => void;
  hasCoverImage?: boolean;
  isPollMode?: boolean;
}

const MoreMenu = ({
  onEscalate,
  onAddCoverImage,
  hasCoverImage,
  isPollMode,
}: MoreMenuProps): ReactElement => {
  const [open, setOpen] = useState(false);

  const handleFull = useCallback(() => {
    onEscalate();
    setOpen(false);
  }, [onEscalate]);

  const handleAddCover = useCallback(() => {
    onAddCoverImage?.();
    setOpen(false);
  }, [onAddCoverImage]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<MenuIcon />}
          aria-label="More options"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" variant="field" className="min-w-64">
        {onAddCoverImage && !hasCoverImage && !isPollMode && (
          <DropdownMenuItem onClick={handleAddCover} className="gap-2">
            <CameraIcon /> Add cover image
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleFull} className="gap-2">
          <EditIcon /> Open in full editor
          <OpenLinkIcon
            className="ml-auto text-text-quaternary"
            size={IconSize.Size16}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

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
            variant={ButtonVariant.Float}
            className="!justify-between !px-3 !font-normal !typo-callout"
          >
            {selected.label}
            <ArrowIcon className="ml-2 rotate-180" secondary />
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
  isUploading?: boolean;
}

const CoverImageDisplay = ({
  src,
  onRemove,
  isUploading,
}: CoverImageDisplayProps): ReactElement => (
  <div className="group relative overflow-hidden rounded-16 bg-surface-float">
    <img
      src={src}
      alt="Post cover"
      className={classNames(
        'max-h-72 w-full object-cover transition-opacity',
        isUploading && 'opacity-50',
      )}
    />
    <Tooltip content="Remove image">
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        icon={<MiniCloseIcon />}
        onClick={onRemove}
        aria-label="Remove image"
        className="!bg-surface-invert/80 absolute right-2 top-2 !text-text-primary !shadow-2 backdrop-blur-sm hover:!bg-surface-invert"
      />
    </Tooltip>
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPollMode, setIsPollMode] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollDuration, setPollDuration] = useState<number | undefined>(
    DEFAULT_POLL_DURATION_DAYS,
  );

  const {
    mode,
    detectedUrl,
    audienceOptions,
    defaultAudience,
    rememberAudience,
  } = useSmartComposer({ body, initialSquadHandle });

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

  const handleTogglePollMode = useCallback(() => {
    setIsPollMode((prev) => {
      const next = !prev;
      logEvent({
        event_name: LogEvent.ToggleModeSmartComposer,
        target_id: next ? 'poll-on' : 'poll-off',
      });
      return next;
    });
  }, [logEvent]);

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

  const isSubmitDisabled = (() => {
    if (isPosting || isUploadingCover || isMultiPosting) {
      return true;
    }
    if (selectedAudienceIds.length === 0) {
      return true;
    }
    if (isPollMode) {
      if (!title.trim()) {
        return true;
      }
      if (validPollOptions.length < MIN_POLL_OPTIONS) {
        return true;
      }
      return false;
    }
    if (isFreeform) {
      return !title.trim() || !body.trim();
    }
    if (!preview?.title && !preview?.id) {
      return true;
    }
    return false;
  })();

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

        if (preview?.id) {
          await onCreateMultiSourcePost({
            sourceIds: selectedAudienceIds,
            sharedPostId: preview.id,
            commentary: body,
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
          commentary: body,
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

      await onSubmitPost(event, audience, body);
    },
    [
      audience,
      body,
      coverImage,
      detectedUrl?.url,
      displayToast,
      ensureCoverUrl,
      isFreeform,
      isMultiMode,
      isPollMode,
      isSubmitDisabled,
      onCreateMultiSourcePost,
      onSubmitFreeformPost,
      onSubmitPollPost,
      onSubmitPost,
      onUpdatePreview,
      pollDuration,
      preview,
      selectedAudienceIds,
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

  const showPreviewArea = !!detectedUrl && !coverImage && !isPollMode;
  const showCoverArea = !!coverImage && !isPollMode;

  const bodyPlaceholder = (() => {
    if (coverImage) {
      return 'Add a caption to go with your image (optional)...';
    }
    return BODY_PLACEHOLDER;
  })();

  const moreMenu = (
    <MoreMenu
      isPollMode={isPollMode}
      onEscalate={handleEscalate}
      onAddCoverImage={() => fileInputRef.current?.click()}
      hasCoverImage={!!coverImage}
    />
  );

  const pollToggleButton = (
    <Tooltip
      content={isPollMode ? 'Switch back to a post' : 'Make this a poll'}
    >
      <Button
        type="button"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<PollIcon />}
        pressed={isPollMode}
        onClick={handleTogglePollMode}
        aria-label={isPollMode ? 'Switch back to a post' : 'Make this a poll'}
        aria-pressed={isPollMode}
      />
    </Tooltip>
  );

  const postButton = (
    <Tooltip content={`Post (${submitShortcut})`}>
      <Button
        type="submit"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        disabled={isSubmitDisabled}
        loading={isPosting || isUploadingCover || isMultiPosting}
        className="ml-2 px-5"
      >
        Post
      </Button>
    </Tooltip>
  );

  return (
    <Modal
      kind={ModalKind.FlexibleTop}
      size={isExpanded ? ModalSize.XLarge : ModalSize.Medium}
      onRequestClose={handleClose}
      isDrawerOnMobile={!isLaptop}
      shouldCloseOnOverlayClick={false}
      overlayClassName={
        isExpanded ? '!pt-0' : 'tablet:!pt-16 laptop:!pt-12'
      }
      className={classNames(
        'flex flex-col',
        isExpanded
          ? '!mb-0 !mt-0 !h-[100vh] !max-h-[100vh] !w-[100vw] !max-w-[100vw] !rounded-none'
          : '!min-h-[36rem] !max-w-[48.75rem] tablet:w-[48.75rem] tablet:!max-h-[calc(100vh-6rem)] laptop:!max-h-[calc(100vh-5rem)]',
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
            <AudienceChip
              selectedIds={selectedAudienceIds}
              options={audienceOptions}
              onChange={handleAudienceChange}
            />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Tooltip
              content={isExpanded ? 'Collapse composer' : 'Expand composer'}
            >
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
                icon={isExpanded ? <CollapseSvg /> : <ExpandSvg />}
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

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-5">
          {renderTitleField()}

          {showCoverArea && (
            <CoverImageDisplay
              src={coverImage.base64}
              onRemove={removeCover}
              isUploading={isUploadingCover}
            />
          )}

          {isPollMode ? (
            <div className="flex flex-col gap-4">
              <PollOptionsEditor
                options={pollOptions}
                onChange={setPollOptions}
              />
              <PollDurationSelect
                value={pollDuration}
                onChange={setPollDuration}
              />
              <div className="flex flex-row items-center gap-2 border-t border-border-subtlest-tertiary pt-3">
                <span className="text-text-tertiary typo-caption1">
                  Poll · {validPollOptions.length}/{MAX_POLL_OPTIONS} options
                </span>
                <div className="ml-auto flex items-center gap-1">
                  {pollToggleButton}
                  {moreMenu}
                  {postButton}
                </div>
              </div>
            </div>
          ) : (
            <RichTextInput
              ref={richTextRef}
              initialContent={seedBody}
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
                gif: false,
              }}
              maxInputLength={MAX_BODY_LENGTH}
              allowBlockFormatting
              minHeightClassName={isExpanded ? 'min-h-[50vh]' : 'min-h-[8rem]'}
              toolbarPosition="bottom"
              hideFooter
              extraInlineActions={pollToggleButton}
              toolbarRightActions={
                <>
                  {moreMenu}
                  {postButton}
                </>
              }
              className={{
                container: '!rounded-none !bg-transparent',
                input: '!px-0 !pt-1',
              }}
            />
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            className="hidden"
            onChange={onFileInputChange}
          />

          {showPreviewArea && (
            <div className="animate-fade-in">
              {(() => {
                if (isLoadingPreview) {
                  return <WritePreviewSkeleton link={detectedUrl.url} />;
                }
                if (!preview?.title) {
                  return null;
                }
                return (
                  <WriteLinkPreview
                    preview={preview}
                    link={detectedUrl.url}
                    showPreviewLink={false}
                  />
                );
              })()}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}

export default SmartComposerModal;
