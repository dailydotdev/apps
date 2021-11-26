import React, { ReactElement, MouseEvent, useState } from 'react';
import { Button } from '../buttons/Button';
import { ModalProps } from './StyledModal';
import {
  ConfirmationModal,
  ConfirmationHeading,
  ConfirmationDescription,
  ConfirmationButtons,
} from './ConfirmationModal';

export interface Props extends ModalProps {
  deleteAccount: () => unknown;
  onDelete: () => unknown;
}

export default function DeleteAccountModal({
  deleteAccount,
  onDelete,
  ...props
}: Props): ReactElement {
  const [deleting, setDeleting] = useState<boolean>(false);

  const onDeleteAccount = async (event: MouseEvent): Promise<void> => {
    if (deleting) {
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount();
      onDelete();
      props.onRequestClose(event);
    } catch (err) {
      setDeleting(false);
    }
  };

  return (
    <ConfirmationModal {...props}>
      <ConfirmationHeading>Delete Account</ConfirmationHeading>
      <ConfirmationDescription>
        Are you sure you want to delete your account? This action cannot be
        undone.
      </ConfirmationDescription>
      <ConfirmationButtons>
        <Button className="btn-secondary" onClick={props.onRequestClose}>
          Cancel
        </Button>
        <Button
          className="btn-primary-ketchup"
          loading={deleting}
          onClick={onDeleteAccount}
        >
          Delete
        </Button>
      </ConfirmationButtons>
    </ConfirmationModal>
  );
}
