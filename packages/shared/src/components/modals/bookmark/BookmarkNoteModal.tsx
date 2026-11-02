import type { FormEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import type { LazyModalCommonProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { ModalHeader } from '../common/ModalHeader';
import { ModalSize } from '../common/types';
import { Button, ButtonVariant } from '../../buttons/Button';
import Textarea from '../../fields/Textarea';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { DevPlusIcon } from '../../icons';
import { PlusModalTitle } from '../common/PlusModalTitle';
import { plusUrl } from '../../../lib/constants';
import { anchorDefaultRel } from '../../../lib/strings';
import { LogEvent, TargetId } from '../../../lib/log';
import Link from '../../utilities/Link';
import type { Post } from '../../../graphql/posts';
import { MAX_BOOKMARK_NOTE_LENGTH } from '../../../graphql/bookmarks';
import { useBookmarkState } from '../../../hooks/bookmark/useBookmarkState';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import { featurePlusCtaCopy } from '../../../lib/featureManagement';
import type { ActiveFeedContextValue } from '../../../contexts';
import { ActiveFeedContext } from '../../../contexts';

export interface BookmarkNoteModalProps extends LazyModalCommonProps {
  post: Post;
  feedContextData?: ActiveFeedContextValue;
}

/**
 * A private note on a bookmark: why it was saved, what to do with it. Plus
 * users write; everyone else sees the field locked behind the upgrade link,
 * the same way folders are presented.
 */
export const BookmarkNoteModal = ({
  post,
  isOpen,
  onRequestClose,
}: BookmarkNoteModalProps): ReactElement => {
  const existingNote = post.bookmark?.note ?? '';
  const [note, setNote] = useState(existingNote);
  const [isSaving, setIsSaving] = useState(false);
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const {
    value: { full: plusCta },
  } = useConditionalFeature({
    feature: featurePlusCtaCopy,
    shouldEvaluate: !isPlus,
  });
  const { onSetNote } = useBookmarkState();
  const isMobile = useViewSize(ViewSize.MobileL);
  const trimmed = note.trim();
  const isUnchanged = trimmed === existingNote.trim();

  // A failed save already toasts; the modal stays open with the text intact
  const save = async (value: string | null) => {
    setIsSaving(true);
    const saved = await onSetNote(post, value);
    setIsSaving(false);
    if (saved) {
      onRequestClose();
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isPlus || isUnchanged) {
      return;
    }
    save(trimmed || null);
  };

  const onUpgradeClick = () =>
    logSubscriptionEvent({
      event_name: LogEvent.UpgradeSubscription,
      target_id: TargetId.BookmarkNote,
    });

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
      kind={Modal.Kind.FlexibleCenter}
      size={ModalSize.Small}
      drawerProps={{ 'aria-label': 'Bookmark note' }}
    >
      <form onSubmit={handleSubmit} className="w-full" id="bookmark_note">
        <ModalHeader className="gap-2" showCloseButton={!isMobile}>
          <PlusModalTitle title="Bookmark note" />
        </ModalHeader>
        <Modal.Body className="flex flex-col gap-4">
          {!isPlus && (
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              Notes keep the reason you saved a post next to the post itself.{' '}
              <Link href={plusUrl} passHref>
                <Button
                  className="h-fit border-0 !p-0"
                  variant={ButtonVariant.Option}
                  tag="a"
                  target="_blank"
                  rel={anchorDefaultRel}
                  onClick={onUpgradeClick}
                >
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Callout}
                    color={TypographyColor.Plus}
                    className="underline"
                  >
                    {plusCta}
                  </Typography>
                </Button>
              </Link>
            </Typography>
          )}
          <Textarea
            inputId="bookmarkNote"
            name="note"
            label="Why did you save this?"
            placeholder="Only you can see this note"
            value={note}
            valueChanged={setNote}
            maxLength={MAX_BOOKMARK_NOTE_LENGTH}
            rows={4}
            readOnly={!isPlus}
            autoFocus={isPlus}
          />
          <div className="flex flex-row items-center justify-end gap-2">
            {isPlus && existingNote && (
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                disabled={isSaving}
                onClick={() => save(null)}
                className="mr-auto"
              >
                Remove note
              </Button>
            )}
            {isPlus ? (
              <Button
                type="submit"
                variant={ButtonVariant.Primary}
                disabled={isUnchanged || isSaving}
              >
                Save note
              </Button>
            ) : (
              <Link href={plusUrl} passHref>
                <Button
                  tag="a"
                  target="_blank"
                  rel={anchorDefaultRel}
                  onClick={onUpgradeClick}
                  variant={ButtonVariant.Primary}
                >
                  <span className="flex gap-1">
                    <DevPlusIcon className="text-action-plus-default" /> Upgrade
                    to plus
                  </span>
                </Button>
              </Link>
            )}
          </div>
        </Modal.Body>
      </form>
    </Modal>
  );
};

const ModalComponent = ({
  feedContextData,
  ...props
}: BookmarkNoteModalProps): ReactElement =>
  feedContextData ? (
    <ActiveFeedContext.Provider value={feedContextData}>
      <BookmarkNoteModal {...props} />
    </ActiveFeedContext.Provider>
  ) : (
    <BookmarkNoteModal {...props} />
  );

export default ModalComponent;
