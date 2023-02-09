import React, { ReactElement } from 'react';
import { Modal, ModalProps } from './common/Modal';
import { ModalHeaderKind } from './common/types';
import styles from './ChangelogModal.module.css';

function ChangelogModal({
  className,
  children,
  ...props
}: ModalProps): ReactElement {
  return (
    <Modal
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
      overlayClassName={styles.changelogModal}
      shouldCloseOnOverlayClick={false}
      {...props}
    >
      <Modal.Header title="New release" kind={ModalHeaderKind.Tertiary} />
    </Modal>
  );
}

export default ChangelogModal;
