import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { usePrompt } from '../../hooks/usePrompt';
import { Button } from '../buttons/Button';
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
    <Modal
      isOpen
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XSmall}
      onRequestClose={onFail}
      className={className.modal}
      overlayClassName="!z-[100]"
      {...props}
    >
      <Modal.Body>
        <Title className={className.title}>{title}</Title>
        {!!description && (
          <Description className={className.description}>
            {description}
          </Description>
        )}
        <Buttons className={className.buttons}>
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
        </Buttons>
      </Modal.Body>
    </Modal>
  );
}
