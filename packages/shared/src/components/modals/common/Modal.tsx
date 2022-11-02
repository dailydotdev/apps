import React, { ReactElement } from 'react';
import ReactModal from 'react-modal';
import classNames from 'classnames';
import { ModalHeader } from './ModalHeader';
import { ModalBody } from './ModalBody';
import { ModalFooter } from './ModalFooter';
import { ModalSidebar } from './ModalSidebar';
import { ModalKind, ModalSize } from './types';

export type ModalProps = ReactModal.Props & {
  children: React.ReactNode;
  kind?: ModalKind;
  size?: ModalSize;
};

export function Modal({
  kind = ModalKind.FlexibleCenter,
  size = ModalSize.Medium,
}: ModalProps): ReactElement {
  return <div className={classNames(kind, size)}>MODAL</div>;
}

Modal.Size = ModalSize;
Modal.Kind = ModalKind;
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.Sidebar = ModalSidebar;
