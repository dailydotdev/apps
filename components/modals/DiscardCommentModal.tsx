import React, { ReactElement, MouseEvent } from 'react';
import {
  ConfirmationModal,
  ConfirmationHeading,
  ConfirmationDescription,
  ConfirmationButtons,
  Props as ModalProps,
} from './StyledModal';
import SecondaryButton from '../buttons/SecondaryButton';
import PrimaryButton from '../buttons/PrimaryButton';

export interface Props extends ModalProps {
  onDeleteComment: (event: MouseEvent) => void;
}

export default function DiscardCommentModal({
  onDeleteComment,
  onRequestClose,
  ...props
}: Props): ReactElement {
  return (
    <ConfirmationModal {...props}>
      <ConfirmationHeading>Discard comment</ConfirmationHeading>
      <ConfirmationDescription>
        Are you sure you want to close and discard your comment?
      </ConfirmationDescription>
      <ConfirmationButtons>
        <SecondaryButton onClick={onRequestClose}>Stay</SecondaryButton>
        <PrimaryButton themeColor="ketchup" onClick={onDeleteComment}>
          Discard
        </PrimaryButton>
      </ConfirmationButtons>
    </ConfirmationModal>
  );
}
