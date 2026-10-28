import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { ModalSize } from '../common/types';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { Checkbox } from '../../fields/Checkbox';
import Textarea from '../../fields/Textarea';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import type { SourcePostModeration } from '../../../graphql/squads';
import {
  MODERATOR_MESSAGE_MAX_LENGTH,
  PostModerationReason,
  postModerationReasonLabels,
} from '../../../graphql/squads';
import type { DeclinePostsParams } from '../../../hooks/squads/useSourceModerationList';

interface DeclinePostModalProps extends ModalProps {
  items: SourcePostModeration[];
  /** Opens with every pending post of the author selected. */
  allFromAuthor?: boolean;
  onDecline: (params: DeclinePostsParams) => Promise<unknown>;
}

const Label = ({ children }: { children: string }): ReactElement => (
  <Typography
    type={TypographyType.Footnote}
    color={TypographyColor.Tertiary}
    bold
  >
    {children}
  </Typography>
);

function DeclinePostModal({
  items,
  allFromAuthor: opensWithAll = false,
  onDecline,
  ...modalProps
}: DeclinePostModalProps): ReactElement {
  const [first] = items;
  // Declining all and muting act on one author in one squad.
  const isOneAuthor = items.every(
    ({ createdBy, source }) =>
      createdBy?.id === first.createdBy?.id && source?.id === first.source?.id,
  );
  const pendingCount = isOneAuthor
    ? Math.max(
        items.length,
        ...items.map(({ authorContext }) => authorContext?.pendingCount ?? 0),
      )
    : items.length;
  const canDeclineAll = isOneAuthor && pendingCount > items.length;
  const [reason, setReason] = useState<PostModerationReason>();
  const [note, setNote] = useState('');
  const [allFromAuthor, setAllFromAuthor] = useState(
    opensWithAll && canDeclineAll,
  );
  const [mute, setMute] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const count = allFromAuthor ? pendingCount : items.length;
  const title = count === 1 ? 'Decline post' : `Decline ${count} posts`;
  const handle = `@${first.createdBy?.username}`;
  const squadName = first.source?.name ?? 'this Squad';
  const isDisabled =
    !reason || (reason === PostModerationReason.Other && !note.trim());

  const onSubmit = async () => {
    if (!reason) {
      return;
    }

    setIsPending(true);
    try {
      await onDecline({
        reason,
        note: note.trim() || undefined,
        allFromAuthor,
        mute,
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Modal
      isDrawerOnMobile
      size={ModalSize.Small}
      {...modalProps}
      formProps={{
        form: '',
        title,
        copy: { right: 'Decline' },
        rightButtonProps: {
          type: 'button',
          loading: isPending,
          disabled: isDisabled,
          onClick: onSubmit,
        },
      }}
    >
      <Modal.Header title={title} />
      <Modal.Body className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label>Reason, shared with the author</Label>
          <div className="flex flex-wrap gap-2">
            {(
              Object.entries(postModerationReasonLabels) as [
                PostModerationReason,
                string,
              ][]
            ).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                size={ButtonSize.Small}
                variant={
                  reason === value ? ButtonVariant.Primary : ButtonVariant.Float
                }
                aria-pressed={reason === value}
                onClick={() => setReason(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        <Textarea
          inputId="decline-post-message"
          name="moderatorMessage"
          label={
            reason === PostModerationReason.Other
              ? 'Message to the author'
              : 'Message to the author (optional)'
          }
          rows={3}
          maxLength={MODERATOR_MESSAGE_MAX_LENGTH}
          value={note}
          valueChanged={setNote}
        />
        {isOneAuthor && (
          <div className="flex flex-col gap-2">
            {canDeclineAll && (
              <Checkbox
                name="decline-all-from-author"
                checked={allFromAuthor}
                onToggleCallback={setAllFromAuthor}
              >
                Decline all {pendingCount} pending posts from {handle}
              </Checkbox>
            )}
            <Checkbox
              name="mute-author"
              checked={mute}
              onToggleCallback={setMute}
            >
              Mute {handle} in {squadName}
            </Checkbox>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="px-2"
            >
              Posts from muted authors skip the queue and stay pending. You can
              unmute them from Members.
            </Typography>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          disabled={isPending}
          onClick={modalProps.onRequestClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          loading={isPending}
          disabled={isDisabled}
          onClick={onSubmit}
        >
          Decline
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeclinePostModal;
