import React, { ReactElement } from 'react';
import { ModalProps } from './StyledModal';
import {
  ConfirmationButtons,
  ConfirmationDescription,
  ConfirmationHeading,
  ConfirmationModal,
} from './ConfirmationModal';
import { Button } from '../buttons/Button';
import Icon from '../icons/V';

export default function DeletedAccountConfirmationModal({
  ...props
}: ModalProps): ReactElement {
  const { onRequestClose } = props;
  return (
    <ConfirmationModal {...props}>
      <Icon style={{ fontSize: '4rem' }} />
      <ConfirmationHeading>Account deleted successfully</ConfirmationHeading>
      <ConfirmationDescription>
        We deleted your personal information and removed the content associated
        with your profile.
      </ConfirmationDescription>
      <ConfirmationButtons>
        <Button className="btn-primary-avocado" onClick={onRequestClose}>
          Thanks!
        </Button>
      </ConfirmationButtons>
    </ConfirmationModal>
  );
}
