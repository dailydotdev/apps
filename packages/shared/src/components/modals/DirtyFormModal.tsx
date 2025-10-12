import type { ReactElement } from 'react';
import React from 'react';
import type { LazyModalCommonProps } from './common/Modal';
import { Modal } from './common/Modal';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

interface DirtyFormModalProps extends LazyModalCommonProps {
  onDiscard: () => void;
  onSave?: () => void;
}

export default function DirtyFormModal({
  isOpen,
  onRequestClose,
  onDiscard,
  onSave,
}: DirtyFormModalProps): ReactElement {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      shouldCloseOnOverlayClick={false}
    >
      <Modal.Body>
        <div className="flex w-full flex-col gap-6 p-6 text-center">
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
          <div className="flex w-full gap-4">
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Medium}
              className="w-full"
              onClick={onDiscard}
            >
              Discard
            </Button>
            {onSave && (
              <Button
                variant={ButtonVariant.Primary}
                size={ButtonSize.Medium}
                className="w-full"
                onClick={onSave}
              >
                Save changes
              </Button>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
