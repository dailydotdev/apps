import React, { ReactElement, MouseEvent } from 'react';
import {
  ConfirmationModal,
  ConfirmationHeading,
  ConfirmationDescription,
  ConfirmationButtons,
  Props as ModalProps,
} from './StyledModal';
import { ColorButton, HollowButton } from '../Buttons';
import { colorKetchup40 } from '../../styles/colors';

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
        <HollowButton onClick={onRequestClose}>Stay</HollowButton>
        <ColorButton background={colorKetchup40} onClick={onDeleteComment}>
          Discard
        </ColorButton>
      </ConfirmationButtons>
    </ConfirmationModal>
  );
}
