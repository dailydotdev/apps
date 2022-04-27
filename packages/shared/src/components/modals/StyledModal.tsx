import Modal from 'react-modal';
import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import classed from '../../lib/classed';
import styles from './StyledModal.module.css';

export interface ModalProps extends Modal.Props {
  padding?: boolean;
  children?: ReactNode;
  contentClassName?: string;
}

export function ReactModalAdapter({
  className,
  contentClassName,
  overlayClassName,
  ...props
}: ModalProps): ReactElement {
  return (
    <Modal
      portalClassName={className.toString()}
      overlayClassName={classNames('overlay', overlayClassName)}
      className={classNames('focus:outline-none modal', contentClassName)}
      {...props}
    />
  );
}

export const StyledModal = classed(ReactModalAdapter, styles.styledModal);
