import React, { ReactElement } from 'react';
import ReactModal from 'react-modal';
import classNames from 'classnames';
import { ModalHeader } from './ModalHeader';
import { ModalBody } from './ModalBody';
import { ModalFooter } from './ModalFooter';
import { ModalSidebar } from './ModalSidebar';
import { ModalContext, ModalKind, ModalSize } from './types';

export type ModalProps = ReactModal.Props & {
  children: React.ReactNode;
  kind?: ModalKind;
  size?: ModalSize;
};

export function Modal({
  className,
  overlayClassName,
  children,
  kind = ModalKind.FlexibleCenter,
  size = ModalSize.Medium,
  onRequestClose
}: ModalProps): ReactElement {
  return (
    <ReactModal
      isOpen={true}
      overlayClassName={classNames(
        'overlay flex fixed flex-col justify-center inset-0 max-h-[100vh] items-center px-5 bg-gradient-to-r to-theme-overlay-to from-theme-overlay-from z-[10]',
        overlayClassName,
      )}
      className={classNames(
        'focus:outline-none modal flex flex-col relative w-full max-w-[26.25rem] max-h-[100%] overflow-y-auto items-center bg-theme-bg-tertiary shadow-2 border border-theme-divider-secondary rounded-16',
        className,
        kind, size
      )}
    >
      <ModalContext.Provider value={onRequestClose}>
        {children}
      </ModalContext.Provider>
    </ReactModal>
  );
}

Modal.Size = ModalSize;
Modal.Kind = ModalKind;
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.Sidebar = ModalSidebar;
