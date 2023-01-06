import React, { ReactElement, MouseEvent } from 'react';
import { Button } from '../buttons/Button';
import { ModalProps } from './common/Modal';
import {
  ConfirmationModal,
  ConfirmationHeading,
  ConfirmationDescription,
  ConfirmationButtons,
} from './ConfirmationModal';

export interface Props extends ModalProps {
  provider: string;
  onConfirm: () => unknown;
}

export default function UnlinkModal({
  provider,
  onConfirm,
  ...props
}: Props): ReactElement {
  const onRemoveClick = async (event: MouseEvent): Promise<void> => {
    onConfirm();
    props.onRequestClose(event);
  };

  return (
    <ConfirmationModal {...props}>
      <ConfirmationHeading>Remove {provider}?</ConfirmationHeading>
      <ConfirmationDescription>
        <p>You will no longer be able to log in with this connected account</p>
      </ConfirmationDescription>
      <ConfirmationButtons>
        <Button className="btn-secondary" onClick={props.onRequestClose}>
          Leave
        </Button>
        <Button
          className="text-white btn-primary-ketchup"
          onClick={onRemoveClick}
        >
          Remove
        </Button>
      </ConfirmationButtons>
    </ConfirmationModal>
  );
}
