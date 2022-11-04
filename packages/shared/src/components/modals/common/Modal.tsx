import React, { ReactElement } from 'react';
import ReactModal from 'react-modal';
import classNames from 'classnames';
import { ModalHeader } from './ModalHeader';
import { ModalBody } from './ModalBody';
import { ModalFooter } from './ModalFooter';
import { ModalSidebar } from './ModalSidebar';
import { ModalKind, ModalPropsContext, ModalSize } from './types';

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
  onRequestClose,
}: ModalProps): ReactElement {
  const modalKindToOverlayClassName = {
    [ModalKind.FixedCenter]: 'justify-center',
    [ModalKind.FlexibleCenter]: 'justify-center',
    [ModalKind.FlexibleTop]: '',
  };
  const modalKindToClassName = {
    [ModalKind.FixedCenter]: '',
    [ModalKind.FlexibleCenter]: 'h-[40rem]',
    [ModalKind.FlexibleTop]: classNames(
      'mt-10',
      size === ModalSize.Medium && 'mt-20',
      size === ModalSize.Large && 'mt-14',
    ),
  };
  const modalSizeToClassName = {
    [ModalSize.XSmall]: 'max-w-[21.25]',
    [ModalSize.Small]: 'max-w-[26.25rem]',
    [ModalSize.Medium]: 'max-w-[35rem]',
    [ModalSize.Large]: 'max-w-[63.75rem]',
  };
  return (
    <ReactModal
      isOpen
      overlayClassName={classNames(
        'overlay flex fixed flex-col inset-0 max-h-[100vh] items-center px-5 bg-gradient-to-r to-theme-overlay-to from-theme-overlay-from z-[10]',
        overlayClassName,
        modalKindToOverlayClassName[kind],
      )}
      className={classNames(
        'focus:outline-none modal flex flex-col relative w-full max-h-[calc(100vh-5rem)] overflow-y-auto items-center bg-theme-bg-tertiary shadow-2 border border-theme-divider-secondary rounded-16',
        className,
        modalKindToClassName[kind],
        modalSizeToClassName[size],
      )}
    >
      <ModalPropsContext.Provider value={{ size, kind, onRequestClose }}>
        {children}
      </ModalPropsContext.Provider>
    </ReactModal>
  );
}

Modal.Size = ModalSize;
Modal.Kind = ModalKind;
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.Sidebar = ModalSidebar;
