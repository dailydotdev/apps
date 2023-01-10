import classNames from 'classnames';
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
    options: {
      title,
      description,
      cancelButton = {},
      okButton = {},
      className = {},
    },
  } = prompt;
  return (
    <ConfirmationModal
      isOpen
      onRequestClose={onFail}
      className={className.modal}
    >
      <ConfirmationHeading className={className.title}>
        {title}
      </ConfirmationHeading>
      {!!description && (
        <ConfirmationDescription className={className.description}>
          {description}
        </ConfirmationDescription>
      )}
      <ConfirmationButtons className={className.buttons}>
        {cancelButton !== null && (
          <Button
            className={classNames('btn-secondary', className.cancel)}
            onClick={onFail}
            {...cancelButton}
          >
            {cancelButton?.title ?? 'Cancel'}
          </Button>
        )}
        {okButton !== null && (
          <Button
            className={classNames('btn-primary', className.ok)}
            onClick={onSuccess}
            {...okButton}
          >
            {okButton?.title ?? 'Ok'}
          </Button>
        )}
      </ConfirmationButtons>
    </ConfirmationModal>
  );
}
