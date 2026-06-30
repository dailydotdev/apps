import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { useQueryClient } from '@tanstack/react-query';
import type { LazyModalCommonProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { ModalKind, ModalSize } from '../common/types';
import { Button, ButtonColor, ButtonVariant } from '../../buttons/Button';
import CloseButton from '../../CloseButton';
import { ButtonSize } from '../../buttons/common';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import {
  InfoIcon,
  MarkdownIcon,
  MaximizeIcon,
  MinimizeIcon,
} from '../../icons';
import { IconSize } from '../../Icon';
import { Tooltip } from '../../tooltip/Tooltip';
import { Switch } from '../../fields/Switch';
import { Drawer, DrawerPosition } from '../../drawers/Drawer';
import { labels } from '../../../lib/labels';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import type { WriteFormTab } from '../../fields/form/common';
import { LogEvent } from '../../../lib/log';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import { usePrompt } from '../../../hooks/usePrompt';
import type { ExternalLinkPreview, Post } from '../../../graphql/posts';
import { getPostByIdKey } from '../../../lib/query';
import { AudienceChip } from '../../post/composer/AudienceChip';
import { KindModePicker } from '../../post/composer/KindModePicker';
import {
  TextForm,
  type TextFormCover,
  type TextFormHandle,
} from '../../post/composer/TextForm';
import { LinkForm } from '../../post/composer/LinkForm';
import { PollForm } from '../../post/composer/PollForm';
import { StandupForm } from '../../post/composer/StandupForm';
import { useNotificationToggle } from '../../../hooks/notifications';
import {
  isUserAudience,
  useComposerAudience,
} from '../../post/composer/useComposerAudience';
import { useComposerSubmit } from '../../post/composer/useComposerSubmit';
import { useStandupCreation } from '../../../hooks/liveRooms/useStandupCreation';
import {
  DEFAULT_LINK,
  DEFAULT_POLL,
  DEFAULT_STANDUP,
  DEFAULT_TEXT,
  type ComposerKind,
  type LinkFormState,
  type PollFormState,
  type StandupFormState,
  type TextFormState,
} from '../../post/composer/types';
import { useDisableSpotlightShortcut } from '../../spotlight/SpotlightContext';

// `defaultWriteTab` is persisted as the WriteFormTab *key* (e.g. "Share"), not
// the enum value ("Share a link") — see settings/composition.tsx which saves
// `value: key`. Map by key to mirror how squads/create.tsx reads it.
const writeFormTabKeyToKind: Record<keyof typeof WriteFormTab, ComposerKind> = {
  NewPost: 'text',
  Share: 'link',
  Poll: 'poll',
  Standup: 'standup',
};

const resolveDefaultKind = (
  defaultWriteTab: WriteFormTab | undefined,
  isStandupEnabled: boolean,
): ComposerKind => {
  const key = defaultWriteTab as unknown as keyof typeof WriteFormTab;
  const defaultKind = key ? writeFormTabKeyToKind[key] : 'text';
  if (defaultKind === 'standup' && !isStandupEnabled) {
    return 'text';
  }
  return defaultKind ?? 'text';
};

export interface SmartComposerModalProps extends LazyModalCommonProps {
  initialUrl?: string;
  initialSquadHandle?: string;
  initialKind?: ComposerKind;
  preview?: ExternalLinkPreview;
  editPost?: Post;
}

export function SmartComposerModal({
  onRequestClose,
  initialUrl,
  initialSquadHandle,
  initialKind,
  preview: initialPreview,
  editPost,
  ...props
}: SmartComposerModalProps): ReactElement {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const queryClient = useQueryClient();
  const { showPrompt } = usePrompt();
  const { shouldShowCta, isEnabled, onToggle, onSubmitted } =
    useNotificationToggle();
  const isStandupEnabled = useStandupCreation();
  const { flags, loadedSettings } = useSettingsContext();
  const isEditing = !!editPost;
  const [kind, setKind] = useState<ComposerKind>(() => {
    if (isEditing) {
      return 'text';
    }
    if (initialUrl) {
      return 'link';
    }
    if (initialKind) {
      return initialKind;
    }
    return resolveDefaultKind(flags?.defaultWriteTab, isStandupEnabled);
  });
  // Settings load async; if the modal opens before they're ready, apply the
  // user's default post type once they arrive — unless the user already picked.
  const hasUserChangedKind = useRef(false);
  const hasAppliedDefaultKind = useRef(loadedSettings);
  useEffect(() => {
    if (!loadedSettings || hasAppliedDefaultKind.current) {
      return;
    }
    hasAppliedDefaultKind.current = true;
    if (isEditing || initialUrl || initialKind || hasUserChangedKind.current) {
      return;
    }
    setKind(resolveDefaultKind(flags?.defaultWriteTab, isStandupEnabled));
  }, [
    loadedSettings,
    isEditing,
    initialUrl,
    initialKind,
    flags?.defaultWriteTab,
    isStandupEnabled,
  ]);
  const [text, setText] = useState<TextFormState>(() =>
    editPost
      ? { title: editPost.title ?? '', body: editPost.content ?? '' }
      : DEFAULT_TEXT,
  );
  const [link, setLink] = useState<LinkFormState>({
    ...DEFAULT_LINK,
    url: initialUrl ?? '',
  });
  const [poll, setPoll] = useState<PollFormState>(DEFAULT_POLL);
  const [standup, setStandup] = useState<StandupFormState>(DEFAULT_STANDUP);
  const [cover, setCover] = useState<TextFormCover | null>(() =>
    editPost?.image ? { preview: editPost.image } : null,
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const textFormRef = useRef<TextFormHandle>(null);
  useDisableSpotlightShortcut();

  const isDirty = useMemo(() => {
    if (editPost) {
      if (text.title !== (editPost.title ?? '')) {
        return true;
      }
      if (text.body !== (editPost.content ?? '')) {
        return true;
      }
      if (cover?.file) {
        return true;
      }
      if (!cover && editPost.image) {
        return true;
      }
      return false;
    }
    if (cover) {
      return true;
    }
    if (text.title.trim() || text.body.trim()) {
      return true;
    }
    if (link.url.trim() || link.commentary.trim()) {
      return true;
    }
    if (poll.question.trim() || poll.options.some((option) => option.trim())) {
      return true;
    }
    if (standup.topic.trim() || standup.description.trim()) {
      return true;
    }
    return false;
  }, [cover, text, link, poll, standup, editPost]);

  const handleClose = useCallback(
    async (event?: React.MouseEvent | React.KeyboardEvent) => {
      const closeAndLog = () => {
        logEvent({
          event_name: LogEvent.CloseSmartComposer,
          extra: JSON.stringify({ kind, isDirty }),
        });
        onRequestClose?.(event);
      };
      if (!isDirty) {
        closeAndLog();
        return;
      }
      const confirmed = await showPrompt({
        title: isEditing ? 'Discard changes?' : 'Discard draft?',
        description:
          'You have unsaved changes. Are you sure you want to discard them?',
        okButton: {
          title: 'Discard',
          variant: ButtonVariant.Primary,
          color: ButtonColor.Ketchup,
        },
        cancelButton: { title: 'Keep editing' },
      });
      if (confirmed) {
        closeAndLog();
      }
    },
    [isDirty, kind, logEvent, onRequestClose, showPrompt, isEditing],
  );

  useEffect(() => {
    logEvent({
      event_name: LogEvent.OpenSmartComposer,
      extra: JSON.stringify({ kind, hasInitialUrl: !!initialUrl }),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKindChange = useCallback(
    (next: ComposerKind) => {
      hasUserChangedKind.current = true;
      setKind((prev) => {
        if (prev !== next) {
          logEvent({
            event_name: LogEvent.SwitchComposerKind,
            extra: JSON.stringify({ from: prev, to: next }),
          });
        }
        return next;
      });
    },
    [logEvent],
  );

  const onCoverChange = useCallback(
    (next: TextFormCover | null) => {
      setCover((prev) => {
        if (next && !prev) {
          logEvent({ event_name: LogEvent.AddComposerCover });
        } else if (!next && prev) {
          logEvent({ event_name: LogEvent.RemoveComposerCover });
        }
        return next;
      });
    },
    [logEvent],
  );

  const onToggleExpand = useCallback(() => {
    setIsExpanded((prev) => {
      logEvent({
        event_name: LogEvent.ToggleComposerExpand,
        extra: JSON.stringify({ expanded: !prev }),
      });
      return !prev;
    });
  }, [logEvent]);

  const onMarkdownModeChange = useCallback(
    (next: boolean) => {
      setIsMarkdownMode((prev) => {
        if (prev !== next) {
          logEvent({
            event_name: LogEvent.ToggleComposerMarkdown,
            extra: JSON.stringify({ markdown: next }),
          });
        }
        return next;
      });
    },
    [logEvent],
  );

  const { audiences, selectedIds, selected, setSelectedIds, userAudienceId } =
    useComposerAudience(initialSquadHandle, editPost?.source?.id);
  const primary = selected[0];
  const isMulti = selected.length > 1;

  const {
    handleSubmit,
    isSubmitDisabled,
    isInFlight,
    preview,
    isLoadingPreview,
    fetchPreview,
    standupErrors,
  } = useComposerSubmit({
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
    editPostId: editPost?.id,
    onComplete: () => {
      if (editPost?.id) {
        queryClient.invalidateQueries({
          queryKey: getPostByIdKey(editPost.id),
        });
      }
      onSubmitted();
      onRequestClose?.();
    },
  });

  const isStandup = kind === 'standup';
  const showSpamWarning =
    !isStandup &&
    selected.filter((audience) => !isUserAudience(audience)).length > 1;
  const isStandupScheduled = standup.scheduleChoice === 'later';
  let submitLabel: string;
  if (isEditing) {
    submitLabel = 'Save changes';
  } else if (isStandup) {
    submitLabel = isStandupScheduled ? 'Schedule standup' : 'Create standup';
  } else if (kind === 'poll') {
    submitLabel = 'Post poll';
  } else {
    submitLabel = 'Post';
  }

  const kindPickerNode = isEditing ? null : (
    <KindModePicker
      value={kind}
      onChange={onKindChange}
      disabled={isInFlight}
      isStandupEnabled={isStandupEnabled}
    />
  );

  const onFormSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      logEvent({
        event_name: LogEvent.SubmitSmartComposer,
        extra: JSON.stringify({ kind, audiences: selectedIds.length }),
      });
      return handleSubmit(event);
    },
    [handleSubmit, kind, logEvent, selectedIds.length],
  );

  const isCoverUploading = !!cover?.isUploading;
  const postButtonNode = (
    <Button
      form="smart_composer"
      type="submit"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      disabled={isSubmitDisabled || isCoverUploading || (isEditing && !isDirty)}
      loading={isInFlight || isCoverUploading}
      className="ml-2 px-5"
    >
      {submitLabel}
    </Button>
  );
  const notificationToggleNode = shouldShowCta ? (
    <Switch
      data-testid="push_notification-switch"
      inputId="smart_composer-push_notification-switch"
      name="push_notification"
      labelClassName="flex-1 font-normal"
      className="py-1"
      compact={false}
      checked={isEnabled}
      onToggle={onToggle}
    >
      Receive updates whenever your Squad members engage with your post
    </Switch>
  ) : null;

  const formContent = (
    <form
      id="smart_composer"
      onSubmit={onFormSubmit}
      className={classNames(
        'flex h-full min-h-0 w-full flex-col',
        isExpanded && 'mx-auto max-w-[58rem]',
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
          {!isStandup && (
            <AudienceChip
              audiences={audiences}
              selectedIds={selectedIds}
              onChange={setSelectedIds}
              userAudienceId={userAudienceId}
              disabled={isInFlight || isEditing}
            />
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {kind === 'text' && (
            <Tooltip
              content={
                isMarkdownMode ? 'Switch to rich text' : 'Switch to Markdown'
              }
            >
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
                icon={<MarkdownIcon secondary={isMarkdownMode} />}
                pressed={isMarkdownMode}
                onClick={() => textFormRef.current?.toggleMarkdownMode()}
                aria-label={
                  isMarkdownMode ? 'Switch to rich text' : 'Switch to Markdown'
                }
                aria-pressed={isMarkdownMode}
              />
            </Tooltip>
          )}
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
              onClick={onToggleExpand}
              aria-label={isExpanded ? 'Collapse composer' : 'Expand composer'}
              aria-pressed={isExpanded}
            />
          </Tooltip>
          <CloseButton
            type="button"
            size={ButtonSize.Small}
            onClick={(event) => {
              handleClose(event);
            }}
            aria-label="Close composer"
          />
        </div>
      </div>
      {showSpamWarning && (
        <div className="bg-status-warning/10 flex w-full shrink-0 items-center gap-2 px-5 py-1.5 text-text-secondary typo-caption2">
          <InfoIcon
            size={IconSize.Size16}
            secondary
            className="shrink-0 text-status-warning"
          />
          <span>{labels.postCreation.warnings.spammyPosts}</span>
        </div>
      )}
      {kind === 'text' && (
        <>
          <TextForm
            ref={textFormRef}
            value={text}
            onChange={setText}
            sourceId={primary?.id}
            cover={cover}
            onCoverChange={onCoverChange}
            toolbarLeading={kindPickerNode}
            toolbarRightActions={postButtonNode}
            onMarkdownModeChange={onMarkdownModeChange}
          />
          {!isMarkdownMode && notificationToggleNode && (
            <div className="-mt-2 flex shrink-0 px-5 pb-5">
              {notificationToggleNode}
            </div>
          )}
        </>
      )}
      {kind === 'standup' && (
        <StandupForm
          value={standup}
          onChange={setStandup}
          topicError={standupErrors.topic}
          scheduledStartError={standupErrors.scheduledStart}
          descriptionError={standupErrors.description}
          toolbarLeading={kindPickerNode}
          toolbarRightActions={postButtonNode}
        />
      )}
      {(kind === 'link' || kind === 'poll') && (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-3 pt-2">
          {kind === 'link' && (
            <LinkForm
              value={link}
              onChange={setLink}
              preview={preview}
              isLoadingPreview={isLoadingPreview}
              fetchPreview={fetchPreview}
              onDismissPreview={() =>
                logEvent({ event_name: LogEvent.DismissComposerPreview })
              }
            />
          )}
          {kind === 'poll' && <PollForm value={poll} onChange={setPoll} />}
        </div>
      )}
      {((kind !== 'text' && kind !== 'standup') || isMarkdownMode) && (
        <div className="flex shrink-0 flex-col gap-3 px-5 pb-5 pt-4">
          <div className="flex items-center justify-between gap-3">
            {kindPickerNode}
            <span className="ml-auto">{postButtonNode}</span>
          </div>
          {notificationToggleNode}
        </div>
      )}
    </form>
  );

  if (!isLaptop) {
    return (
      <Drawer
        isOpen
        isFullScreen
        position={DrawerPosition.Bottom}
        onClose={() => {
          handleClose();
        }}
        className={{ wrapper: 'flex flex-col p-0' }}
      >
        {formContent}
      </Drawer>
    );
  }

  return (
    <Modal
      kind={ModalKind.FlexibleTop}
      size={isExpanded ? ModalSize.XLarge : ModalSize.Medium}
      onRequestClose={handleClose}
      overlayClassName={isExpanded ? '!pt-0' : 'tablet:!pt-16 laptop:!pt-12'}
      className={classNames(
        'flex flex-col',
        isExpanded
          ? '!mb-0 !mt-0 !h-[100vh] !max-h-[100vh] !w-[100vw] !max-w-[100vw] !rounded-none'
          : '!min-h-[30.5rem] !max-w-[48.75rem] tablet:!max-h-[calc(100vh-7rem)] tablet:w-[48.75rem] laptop:!max-h-[calc(100vh-6rem)]',
      )}
      {...props}
    >
      {formContent}
    </Modal>
  );
}

export default SmartComposerModal;
