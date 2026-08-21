import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { usePrompt } from '../../hooks/usePrompt';
import type { ButtonProps } from '../buttons/Button';
import { Button, ButtonIconPosition, ButtonVariant } from '../buttons/Button';
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
  const [isPending, setIsPending] = useState(false);

  if (!prompt || !prompt.options) {
    return null;
  }
  const { options } = prompt;
  const { onError, onFail, onSuccess } = prompt;
  const {
    title,
    description,
    icon,
    content,
    promptSize = Modal.Size.Small,
    cancelButton = {},
    okButton = {},
    className = {},
    shouldCloseOnOverlayClick,
  } = options;
  const { onConfirm } = options;
  const {
    className: cancelButtonClassName,
    color: cancelButtonColor,
    disabled: cancelButtonDisabled,
    icon: cancelButtonIcon,
    iconPosition: cancelButtonIconPosition,
    title: cancelButtonTitle,
    variant: cancelButtonVariant,
    ...cancelButtonProps
  } = cancelButton ?? {};
  const {
    className: okButtonClassName,
    color: okButtonColor,
    disabled: okButtonDisabled,
    icon: okButtonIcon,
    iconPosition: okButtonIconPosition,
    loading: okButtonLoading,
    title: okButtonTitle,
    variant: okButtonVariant,
    ...okButtonProps
  } = okButton ?? {};
  const handleFail = () => {
    if (isPending) {
      return;
    }

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

    setIsPending(true);
    Promise.resolve(onConfirm())
      .then(() => {
        setIsPending(false);
        onSuccess();
      })
      .catch((error) => {
        setIsPending(false);
        onError(error);
      });
  };
  const cancelActionButtonProps = {
    ...cancelButtonProps,
    variant: cancelButtonVariant ?? ButtonVariant.Secondary,
    ...(cancelButtonColor ? { color: cancelButtonColor } : {}),
    ...(cancelButtonIcon
      ? {
          icon: cancelButtonIcon,
          iconPosition: cancelButtonIconPosition ?? ButtonIconPosition.Left,
        }
      : {}),
    onClick: handleFail,
    disabled: isPending || !!cancelButtonDisabled,
    className: classNames('w-full tablet:w-auto', cancelButtonClassName),
  } as ButtonProps<'button'>;
  const okActionButtonProps = {
    ...okButtonProps,
    variant: okButtonVariant ?? ButtonVariant.Primary,
    ...(okButtonColor ? { color: okButtonColor } : {}),
    ...(okButtonIcon
      ? {
          icon: okButtonIcon,
          iconPosition: okButtonIconPosition ?? ButtonIconPosition.Left,
        }
      : {}),
    onClick: handleSuccess,
    disabled: isPending || !!okButtonDisabled,
    loading: isPending || !!okButtonLoading,
    className: classNames('w-full tablet:w-auto', okButtonClassName),
  } as ButtonProps<'button'>;

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
      shouldCloseOnOverlayClick={isPending ? false : shouldCloseOnOverlayClick}
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
            <Button {...cancelActionButtonProps}>
              {cancelButtonTitle ?? 'Cancel'}
            </Button>
          )}
          {okButton !== null && (
            <Button {...okActionButtonProps}>{okButtonTitle ?? 'Ok'}</Button>
          )}
        </Buttons>
      </Modal.Body>
    </Modal>
  );
}
