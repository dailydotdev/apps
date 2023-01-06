import React, { ReactElement, MouseEvent } from 'react';
import { Button } from '../buttons/Button';
import { ModalProps } from './common/Modal';
import {
  ConfirmationModal,
  ConfirmationHeading,
  ConfirmationDescription,
  ConfirmationButtons,
} from './ConfirmationModal';

export interface DiscardActionModalProps extends ModalProps {
  title?: string;
  description?: string;
  leftButtonText?: string;
  leftButtonAction?: (event: MouseEvent) => void;
  rightButtonText?: string;
  rightButtonAction?: (event: MouseEvent) => void;
  rightButtonClass?: string;
}

export default function DiscardActionModal({
  rightButtonAction,
  onRequestClose,
  leftButtonAction = onRequestClose,
  title = 'Discard comment',
  description = 'Are you sure you want to close and discard your comment?',
  leftButtonText = 'Stay',
  rightButtonText = 'Discard',
  rightButtonClass = 'btn-primary-ketchup',
  ...props
}: DiscardActionModalProps): ReactElement {
  return (
    <ConfirmationModal {...props}>
      <ConfirmationHeading>{title}</ConfirmationHeading>
      <ConfirmationDescription>{description}</ConfirmationDescription>
      <ConfirmationButtons>
        <Button className="btn-secondary" onClick={leftButtonAction}>
          {leftButtonText}
        </Button>
        <Button className={rightButtonClass} onClick={rightButtonAction}>
          {rightButtonText}
        </Button>
      </ConfirmationButtons>
    </ConfirmationModal>
  );
}
