import React, { ReactElement } from 'react';
import { ResponsiveModal } from './ResponsiveModal';
import { Modal } from './common/Modal';
import { ModalProps } from './StyledModal';
import { ModalCloseButton } from './ModalCloseButton';
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
  // return (
  //   <ResponsiveModal
  //     {...modalProps}
  //     onRequestClose={onRequestClose}
  //     padding={false}
  //   >
  //     <header className="flex justify-between items-center py-4 px-6 w-full border-b border-theme-divider-tertiary">
  //       <h3 className="font-bold typo-title3">Customize</h3>
  //       <ModalCloseButton onClick={onRequestClose} />
  //     </header>
  //     <section className="overflow-auto relative w-full h-full shrink max-h-full">
  //       <Settings className="p-6"/>
  //     </section>
  //   </ResponsiveModal>
  // );
}

export default UserSettingsModal;
