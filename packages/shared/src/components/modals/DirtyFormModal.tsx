import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { LazyModalCommonProps } from './common/Modal';
import { Modal } from './common/Modal';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { useLazyModal } from '../../hooks/useLazyModal';

interface DirtyFormModalProps extends LazyModalCommonProps {
  onDiscard: () => void;
  onSave: () => void | Promise<void>;
}

export default function DirtyFormModal({
  isOpen,
  onRequestClose,
  onDiscard,
  onSave,
}: DirtyFormModalProps): ReactElement {
  const { closeModal } = useLazyModal();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const result = onSave?.();

    // Callers that save synchronously keep the original fire-and-forget close.
    if (!(result instanceof Promise)) {
      closeModal();
      return;
    }

    setIsSaving(true);

    try {
      await result;
    } catch {
      // The caller owns surfacing the failure; the modal closes either way so
      // the user lands back on their still-unsaved form.
    } finally {
      setIsSaving(false);
      closeModal();
    }
  };

  const handleDiscard = () => {
    onDiscard();
    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      // Dismissing mid-save would close whichever modal is current by the time
      // the save settles, so the overlay and Escape are inert while it runs.
      onRequestClose={isSaving ? undefined : onRequestClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      shouldCloseOnOverlayClick={!isSaving}
      isDrawerOnMobile
      drawerProps={{ displayCloseButton: false }}
    >
      <Modal.Body className="gap-6 text-center">
        <div className="flex flex-col gap-4">
          <Typography
            type={TypographyType.Title3}
            color={TypographyColor.Primary}
            bold
          >
            Discard changes?
          </Typography>
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            You have unsaved changes that will be lost
          </Typography>
        </div>
        <div className="flex w-full items-center justify-center gap-4">
          <Button
            className="flex-1"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Medium}
            onClick={handleDiscard}
            disabled={isSaving}
          >
            Discard
          </Button>
          <Button
            className="flex-1"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            onClick={handleSave}
            disabled={isSaving}
            loading={isSaving}
          >
            Save changes
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
