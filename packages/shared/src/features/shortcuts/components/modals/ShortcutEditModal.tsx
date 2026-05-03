import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  ButtonV2,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/ButtonV2';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import { Justify } from '../../../../components/utilities';
import type { Shortcut } from '../../types';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import type { ShortcutEditFormState } from '../ShortcutEditForm';
import { ShortcutEditForm } from '../ShortcutEditForm';

type ShortcutEditModalProps = ModalProps & {
  mode: 'add' | 'edit';
  shortcut?: Shortcut;
  onSubmitted?: () => void;
};

const FORM_ID = 'shortcut-edit-form';

export default function ShortcutEditModal({
  mode,
  shortcut,
  onSubmitted,
  ...props
}: ShortcutEditModalProps): ReactElement {
  const { closeModal } = useLazyModal();
  const [formState, setFormState] = useState<ShortcutEditFormState>({
    isSubmitting: false,
    isUploading: false,
  });
  const close = () => {
    closeModal();
    props.onRequestClose?.(undefined as never);
  };

  return (
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Small} {...props}>
      <Modal.Header showCloseButton>
        <Typography tag={TypographyTag.H3} type={TypographyType.Body} bold>
          {mode === 'add' ? 'Add shortcut' : 'Edit shortcut'}
        </Typography>
      </Modal.Header>
      <Modal.Body>
        <ShortcutEditForm
          mode={mode}
          shortcut={shortcut}
          formId={FORM_ID}
          onStateChange={setFormState}
          onDone={() => {
            onSubmitted?.();
            close();
          }}
        />
      </Modal.Body>
      <Modal.Footer justify={Justify.End}>
        <ButtonV2
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          onClick={close}
        >
          Cancel
        </ButtonV2>
        <ButtonV2
          type="submit"
          form={FORM_ID}
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          disabled={formState.isSubmitting || formState.isUploading}
        >
          {mode === 'add' ? 'Add' : 'Save'}
        </ButtonV2>
      </Modal.Footer>
    </Modal>
  );
}
