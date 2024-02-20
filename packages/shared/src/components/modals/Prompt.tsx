import React, { ReactElement } from 'react';
import { usePrompt } from '../../hooks/usePrompt';
import { Button, ButtonVariant } from '../buttons/Button';
import classed from '../../lib/classed';
import { Modal, ModalProps } from './common/Modal';

const Title = classed('h1', 'font-bold typo-title3 text-center');
const Description = classed(
  'div',
  'mt-4 mb-6 text-theme-label-secondary text-center typo-callout',
);
const Buttons = classed('div', 'flex items-center justify-around self-stretch');

export function PromptElement(props: Partial<ModalProps>): ReactElement {
  const { prompt } = usePrompt();
  if (!prompt) {
    return null;
  }
  const {
    onFail,
    onSuccess,
    options: {
      title,
      description,
      content,
      promptSize = Modal.Size.XSmall,
      cancelButton = {},
      okButton = {},
      className = {},
    },
  } = prompt;
  return (
    <Modal
      isOpen
      kind={Modal.Kind.FlexibleCenter}
      size={promptSize}
      onRequestClose={onFail}
      className={className.modal}
      overlayClassName="!z-max"
      {...props}
    >
      <Modal.Body>
        <Title className={className.title}>{title}</Title>
        {!!description && (
          <Description className={className.description}>
            {description}
          </Description>
        )}
        {content}
        <Buttons className={className.buttons}>
          {cancelButton !== null && (
            <Button
              variant={cancelButton.variant ?? ButtonVariant.Secondary}
              color={cancelButton.color}
              icon={cancelButton.icon}
              iconPosition={cancelButton.iconPosition}
              onClick={onFail}
              {...cancelButton}
            >
              {cancelButton?.title ?? 'Cancel'}
            </Button>
          )}
          {okButton !== null && (
            <Button
              variant={okButton.variant ?? ButtonVariant.Primary}
              color={okButton.color}
              icon={okButton.icon}
              iconPosition={okButton.iconPosition}
              onClick={onSuccess}
              {...okButton}
            >
              {okButton?.title ?? 'Ok'}
            </Button>
          )}
        </Buttons>
      </Modal.Body>
    </Modal>
  );
}
