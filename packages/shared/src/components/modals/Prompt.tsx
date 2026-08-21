import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
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

export function PromptElement(props: Partial<ModalProps>): ReactElement | null {
  const { prompt } = usePrompt();
  const confirmingPrompt = useRef<typeof prompt>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  if (!prompt || !prompt.options) {
    return null;
  }
  const { onError, onFail, onSuccess } = prompt;
  const { options } = prompt;
  const {
    title,
    description,
    icon,
    content,
    onConfirm,
    promptSize = Modal.Size.Small,
    cancelButton = {},
    okButton = {},
    className = {},
    shouldCloseOnOverlayClick,
  } = options;
  const isPending = isConfirming && confirmingPrompt.current === prompt;
  const handleFail = () => {
    confirmingPrompt.current = null;
    setIsConfirming(false);
    onFail();
  };
  const handleSuccess = () => {
    if (isPending) {
      return;
    }

    if (!onConfirm) {
      onSuccess();
      return;
    }

    const settle = (callback: () => void) => {
      if (confirmingPrompt.current !== prompt) {
        return;
      }

      confirmingPrompt.current = null;
      setIsConfirming(false);
      callback();
    };

    confirmingPrompt.current = prompt;
    setIsConfirming(true);
    Promise.resolve(onConfirm())
      .then(() => settle(onSuccess))
      .catch(() => settle(onError));
  };

  return (
    <Modal
      isOpen
      kind={Modal.Kind.FlexibleCenter}
      size={promptSize}
      onRequestClose={handleFail}
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
              {...cancelButton}
              onClick={handleFail}
              className={classNames(
                'w-full tablet:w-auto',
                cancelButton.className,
              )}
            >
              {cancelButton.title ?? 'Cancel'}
            </Button>
          )}
          {okButton !== null && (
            <Button
              variant={okButton.variant ?? ButtonVariant.Primary}
              color={okButton.color}
              icon={okButton.icon}
              iconPosition={okButton.iconPosition}
              {...okButton}
              onClick={handleSuccess}
              disabled={isPending || okButton.disabled}
              loading={isPending || okButton.loading}
              className={classNames('w-full tablet:w-auto', okButton.className)}
            >
              {okButton.title ?? 'Ok'}
            </Button>
          )}
        </Buttons>
      </Modal.Body>
    </Modal>
  );
}
