import React, { ReactElement } from 'react';
import { Modal, ModalProps } from './common/Modal';
import Settings from '../Settings';
import { useTrackModal } from '../../hooks/useTrackModal';

export function UserSettingsModal({
  onRequestClose,
  ...modalProps
}: ModalProps): ReactElement {
  useTrackModal({ isOpen: modalProps.isOpen, title: 'feed settings' });
  return (
    <Modal
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
      {...modalProps}
    >
      <Modal.Header title="Customize" />
      <Modal.Body>
        <Settings />
      </Modal.Body>
    </Modal>
  );
}

export default UserSettingsModal;
