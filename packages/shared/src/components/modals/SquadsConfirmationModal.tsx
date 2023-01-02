import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
import {
  ConfirmationButtons,
  ConfirmationDescription,
  ConfirmationHeading,
  ConfirmationModal,
} from './ConfirmationModal';

type ConfirmationProps = {
  onRequestClose: () => void;
  onContinue: () => void;
};

export function SquadsConfirmation({
  onRequestClose,
  onContinue,
}: ConfirmationProps): ReactElement {
  return (
    <ConfirmationModal isOpen>
      <ConfirmationHeading>Quit the process?</ConfirmationHeading>
      <ConfirmationDescription>
        <p>
          Learning is more powerful together. Are you sure you want to quit the
          process?
        </p>
        <p>p.s you can create a new squad from the left sidebar</p>
      </ConfirmationDescription>
      <ConfirmationButtons>
        <Button className="btn-secondary" onClick={onRequestClose}>
          Cancel
        </Button>
        <Button className="btn-primary-ketchup" onClick={onContinue}>
          Continue
        </Button>
      </ConfirmationButtons>
    </ConfirmationModal>
  );
}
