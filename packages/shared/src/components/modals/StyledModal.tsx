import classed from '../../lib/classed';
import styles from './StyledModal.module.css';
import Modal from 'react-modal';
import React, { ReactElement, ReactNode } from 'react';

export interface ModalProps extends Modal.Props {
  children?: ReactNode;
}

export function ReactModalAdapter({
  className,
  ...props
}: ModalProps): ReactElement {
  return (
    <Modal
      portalClassName={className.toString()}
      overlayClassName="overlay"
      className="modal focus:outline-none"
      {...props}
    />
  );
}

export const StyledModal = classed(ReactModalAdapter, styles.styledModal);
