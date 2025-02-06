import type { ReactElement } from 'react';
import React from 'react';
import { Modal } from '../modals/common/Modal';
import { PlusDesktop } from './PlusDesktop';

const PlusModal = (): ReactElement => {
  return (
    <Modal className="!max-h-fit !w-fit" isOpen onRequestClose={() => {}}>
      <Modal.Body>
        <PlusDesktop shouldShowPlusHeader />
      </Modal.Body>
    </Modal>
  );
};

export default PlusModal;
