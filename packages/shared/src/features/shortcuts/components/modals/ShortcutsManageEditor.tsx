import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  ButtonV2,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/ButtonV2';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import type { Shortcut } from '../../types';
import type { ShortcutEditFormState } from '../ShortcutEditForm';
import { ShortcutEditForm } from '../ShortcutEditForm';

const EDIT_FORM_ID = 'shortcut-edit-form-manage';

export type ShortcutsManageEditingState =
  | { mode: 'add' }
  | { mode: 'edit'; shortcut: Shortcut };

interface ShortcutsManageEditorProps extends ModalProps {
  editing: ShortcutsManageEditingState;
  onClose: () => void;
}

export function ShortcutsManageEditor({
  editing,
  onClose,
  ...props
}: ShortcutsManageEditorProps): ReactElement {
  const [formState, setFormState] = useState<ShortcutEditFormState>({
    isSubmitting: false,
    isUploading: false,
  });

  return (
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Medium} {...props}>
      <Modal.Header showCloseButton={false}>
        <Typography tag={TypographyTag.H3} type={TypographyType.Body} bold>
          {editing.mode === 'add' ? 'Add shortcut' : 'Edit shortcut'}
        </Typography>
        <ButtonV2
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          className="-mr-2 ml-auto tablet:-mr-4"
          onClick={onClose}
        >
          Back
        </ButtonV2>
      </Modal.Header>
      <Modal.Body>
        <ShortcutEditForm
          mode={editing.mode}
          shortcut={editing.mode === 'edit' ? editing.shortcut : undefined}
          formId={EDIT_FORM_ID}
          onStateChange={setFormState}
          onDone={onClose}
        />
        <div className="mt-4 flex justify-end gap-2">
          <ButtonV2
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            onClick={onClose}
          >
            Cancel
          </ButtonV2>
          <ButtonV2
            type="submit"
            form={EDIT_FORM_ID}
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            disabled={formState.isSubmitting || formState.isUploading}
          >
            {editing.mode === 'add' ? 'Add' : 'Save'}
          </ButtonV2>
        </div>
      </Modal.Body>
    </Modal>
  );
}
