import React, { ReactElement } from 'react';
import { usePrompt } from '../../hooks/usePrompt';
import { Button } from '../buttons/Button';
import {
  ConfirmationModal,
  ConfirmationHeading,
  ConfirmationDescription,
  ConfirmationButtons,
} from './ConfirmationModal';

export function PromptElement(): ReactElement {
  const { prompt } = usePrompt();
  if (!prompt) return null;
  const {
    onFail,
    onSuccess,
    options: { title, description, cancelButton, okButton },
  } = prompt;
  return (
    <ConfirmationModal isOpen onRequestClose={onFail}>
      <ConfirmationHeading>{title}</ConfirmationHeading>
      {!!description && (
        <ConfirmationDescription>{description}</ConfirmationDescription>
      )}
      <ConfirmationButtons>
        {cancelButton !== null && (
          <Button
            className="btn-secondary"
            onClick={onFail}
            {...(cancelButton || {})}
          >
            {cancelButton?.title ?? 'Cancel'}
          </Button>
        )}
        {okButton !== null && (
          <Button
            className="btn-primary"
            onClick={onSuccess}
            {...(okButton || {})}
          >
            {okButton?.title ?? 'Ok'}
          </Button>
        )}
      </ConfirmationButtons>
    </ConfirmationModal>
  );
}
