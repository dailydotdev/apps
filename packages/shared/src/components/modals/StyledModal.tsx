import Modal from 'react-modal';
import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';

export interface ModalProps extends Modal.Props {
  padding?: boolean;
  children?: ReactNode;
  contentClassName?: string;
}

export function StyledModal({
  className,
  contentClassName,
  overlayClassName,
  ...props
}: ModalProps): ReactElement {
  return (
    <Modal
      portalClassName={classNames(className.toString())}
      overlayClassName={classNames(
        'flex fixed flex-col justify-center inset-0 max-h-[100vh] items-center px-5 bg-theme-overlay-quaternary z-[10]',
        'overlay',
        overlayClassName,
      )}
      className={classNames(
        'focus:outline-none modal',
        'flex flex-col relative w-full max-w-[26.25rem] max-h-[100%] overflow-y-auto items-center bg-theme-bg-tertiary shadow-2 border border-theme-divider-secondary rounded-16',
        contentClassName,
      )}
      {...props}
    />
  );
}
