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
    if (!onSave) {
      closeModal();
      return;
    }

    setIsSaving(true);
    try {
      await onSave();
      closeModal();
    } catch {
      // Error handled by caller's onError - keep modal open
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    onDiscard();
    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      shouldCloseOnOverlayClick
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
            loading={isSaving}
            disabled={isSaving}
          >
            Save changes
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
