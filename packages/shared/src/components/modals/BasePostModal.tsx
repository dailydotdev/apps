import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Modal, ModalProps } from './common/Modal';
import styles from './BasePostModal.module.css';

function BasePostModal({
  className,
  children,
  ...props
}: ModalProps): ReactElement {
  return (
    <Modal
      size={Modal.Size.XLarge}
      kind={Modal.Kind.FlexibleTop}
      portalClassName={styles.postModal}
      id="post-modal"
      {...props}
      className={classNames(className, 'post-modal focus:outline-none')}
      overlayClassName="post-modal-overlay bg-overlay-quaternary-onion"
    >
      {children}
    </Modal>
  );
}

export default BasePostModal;
