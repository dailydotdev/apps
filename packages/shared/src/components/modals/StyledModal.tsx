import Modal from 'react-modal';
import React, { ReactElement, ReactNode } from 'react';
import classed from '../../lib/classed';
import styles from './StyledModal.module.css';

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
      className="focus:outline-none modal"
      {...props}
    />
  );
}

export const StyledModal = classed(ReactModalAdapter, styles.styledModal);
