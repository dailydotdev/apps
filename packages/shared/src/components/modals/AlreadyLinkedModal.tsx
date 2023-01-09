import React, { ReactElement } from 'react';
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
}

export default function AlreadyLinkedModal({
  provider,
  ...props
}: Props): ReactElement {
  return (
    <ConfirmationModal {...props}>
      <ConfirmationHeading>Account already linked</ConfirmationHeading>
      <ConfirmationDescription>
        <p>
          The “{provider}” account you trying to link, is already linked to
          another daily account.
        </p>
      </ConfirmationDescription>
      <ConfirmationButtons>
        <Button className="btn-secondary" onClick={props.onRequestClose}>
          Close
        </Button>
      </ConfirmationButtons>
    </ConfirmationModal>
  );
}
