import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import type { LazyModalCommonProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { ModalKind, ModalSize } from '../common/types';
import { Button, ButtonVariant } from '../../buttons/Button';
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
import { labels } from '../../../lib/labels';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { ExternalLinkPreview } from '../../../graphql/posts';
import { AudienceChip } from '../../post/composer/AudienceChip';
import { KindModePicker } from '../../post/composer/KindModePicker';
import {
  TextForm,
  type TextFormCover,
  type TextFormHandle,
} from '../../post/composer/TextForm';
import { LinkForm } from '../../post/composer/LinkForm';
import { PollForm } from '../../post/composer/PollForm';
import {
  isUserAudience,
  useComposerAudience,
} from '../../post/composer/useComposerAudience';
import { useComposerSubmit } from '../../post/composer/useComposerSubmit';
import {
  DEFAULT_LINK,
  DEFAULT_POLL,
  DEFAULT_TEXT,
  type ComposerKind,
  type LinkFormState,
  type PollFormState,
  type TextFormState,
} from '../../post/composer/types';

export interface SmartComposerModalProps extends LazyModalCommonProps {
  initialUrl?: string;
  initialSquadHandle?: string;
  preview?: ExternalLinkPreview;
}

export function SmartComposerModal({
  onRequestClose,
  initialUrl,
  initialSquadHandle,
  preview: initialPreview,
  ...props
}: SmartComposerModalProps): ReactElement {
  const { user } = useAuthContext();
  const [kind, setKind] = useState<ComposerKind>(initialUrl ? 'link' : 'text');
  const [text, setText] = useState<TextFormState>(DEFAULT_TEXT);
  const [link, setLink] = useState<LinkFormState>({
    ...DEFAULT_LINK,
    url: initialUrl ?? '',
  });
  const [poll, setPoll] = useState<PollFormState>(DEFAULT_POLL);
  const [cover, setCover] = useState<TextFormCover | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const textFormRef = useRef<TextFormHandle>(null);

  const { audiences, selectedIds, selected, setSelectedIds, userAudienceId } =
    useComposerAudience(initialSquadHandle);
  const primary = selected[0];
  const isMulti = selected.length > 1;

  const {
    handleSubmit,
    isSubmitDisabled,
    isInFlight,
    preview,
    isLoadingPreview,
    fetchPreview,
  } = useComposerSubmit({
    kind,
    text,
    link,
    poll,
    cover,
    primary,
    selectedIds,
    isMulti,
    initialPreview,
    onComplete: () => onRequestClose?.(),
  });

  const showSpamWarning =
    selected.filter((audience) => !isUserAudience(audience)).length > 1;
  const submitLabel = kind === 'poll' ? 'Post poll' : 'Post';

  const kindPickerNode = (
    <KindModePicker value={kind} onChange={setKind} disabled={isInFlight} />
  );

  const postButtonNode = (
    <Button
      form="smart_composer"
      type="submit"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      disabled={isSubmitDisabled}
      loading={isInFlight}
      className="px-5"
    >
      {submitLabel}
    </Button>
  );

  return (
    <Modal
      kind={ModalKind.FlexibleTop}
      size={isExpanded ? ModalSize.XLarge : ModalSize.Medium}
      onRequestClose={onRequestClose}
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
        id="smart_composer"
        onSubmit={handleSubmit}
        className="flex h-full min-h-0 w-full flex-col"
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
              audiences={audiences}
              selectedIds={selectedIds}
              onChange={setSelectedIds}
              userAudienceId={userAudienceId}
              disabled={isInFlight}
            />
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
                    isMarkdownMode
                      ? 'Switch to rich text'
                      : 'Switch to Markdown'
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
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-label={
                  isExpanded ? 'Collapse composer' : 'Expand composer'
                }
                aria-pressed={isExpanded}
              />
            </Tooltip>
            <CloseButton
              type="button"
              size={ButtonSize.Small}
              onClick={(event) => onRequestClose?.(event)}
              aria-label="Close composer"
            />
          </div>
        </div>
        {showSpamWarning && (
          <div className="flex w-full shrink-0 items-center gap-2 bg-overlay-tertiary-bun px-5 py-1.5 text-text-secondary typo-caption2">
            <InfoIcon
              size={IconSize.Size16}
              secondary
              className="shrink-0 text-status-warning"
            />
            <span>{labels.postCreation.warnings.spammyPosts}</span>
          </div>
        )}
        {kind === 'text' && (
          <TextForm
            ref={textFormRef}
            value={text}
            onChange={setText}
            sourceId={primary?.id}
            cover={cover}
            onCoverChange={setCover}
            toolbarLeading={kindPickerNode}
            toolbarRightActions={postButtonNode}
            onMarkdownModeChange={setIsMarkdownMode}
          />
        )}
        {kind !== 'text' && (
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-3 pt-2">
            {kind === 'link' && (
              <LinkForm
                value={link}
                onChange={setLink}
                preview={preview}
                isLoadingPreview={isLoadingPreview}
                fetchPreview={fetchPreview}
              />
            )}
            {kind === 'poll' && <PollForm value={poll} onChange={setPoll} />}
          </div>
        )}
        {(kind !== 'text' || isMarkdownMode) && (
          <div className="flex shrink-0 items-center justify-between gap-3 px-5 pb-4 pt-3">
            {kindPickerNode}
            {postButtonNode}
          </div>
        )}
      </form>
    </Modal>
  );
}

export default SmartComposerModal;
