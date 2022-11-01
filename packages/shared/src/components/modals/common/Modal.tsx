import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ModalHeader } from './ModalHeader';
import { ModalBody } from './ModalBody';
import { ModalFooter } from './ModalFooter';
import { ModalSidebar } from './ModalSidebar';
import { ModalKind, ModalSize } from './types';

export type ModalProps = {
  kind?: ModalKind;
  size?: ModalSize;
};

export function Modal({
  kind = ModalKind.FlexibleCenter,
  size = ModalSize.Medium,
}: ModalProps): ReactElement {
  return <div className={classNames(kind, size)}>MODAL</div>;
}

Modal.prototype.Header = ModalHeader;
Modal.prototype.Body = ModalBody;
Modal.prototype.Footer = ModalFooter;
Modal.prototype.Sidebar = ModalSidebar;
