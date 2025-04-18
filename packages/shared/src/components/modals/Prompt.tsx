import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { usePrompt } from '../../hooks/usePrompt';
import { Button, ButtonVariant } from '../buttons/Button';
import classed from '../../lib/classed';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';

const Title = classed('h1', 'font-bold typo-title3 text-center');
const Description = classed(
  'div',
  'mt-4 mb-6 text-text-secondary text-center typo-callout',
);
const Buttons = classed(
  'div',
  'flex items-center justify-center self-stretch flex-col tablet:flex-row gap-4',
);

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
      icon,
      content,
      promptSize = Modal.Size.Small,
      cancelButton = {},
      okButton = {},
      className = {},
      shouldCloseOnOverlayClick,
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
      isDrawerOnMobile
      drawerProps={{ displayCloseButton: false, appendOnRoot: true }}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      {...props}
    >
      <Modal.Body>
        {icon && <div className="mx-auto mb-2">{icon}</div>}
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
              className={classNames(
                'w-full tablet:w-auto',
                cancelButton.className,
              )}
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
              className={classNames('w-full tablet:w-auto', okButton.className)}
            >
              {okButton?.title ?? 'Ok'}
            </Button>
          )}
        </Buttons>
      </Modal.Body>
    </Modal>
  );
}
