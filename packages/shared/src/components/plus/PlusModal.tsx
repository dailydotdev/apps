import type { ReactElement } from 'react';
import React from 'react';
import { Modal } from '../modals/common/Modal';
import { PlusDesktop } from './PlusDesktop';
import { checkIsExtension } from '../../lib/func';
import PlusExtension from './PlusExtension';
import { useViewSize, ViewSize } from '../../hooks';
import PlusMobileDrawer from './PlusMobileDrawer';

const PlusModal = (): ReactElement => {
  const isExtension = checkIsExtension();
  const isLaptop = useViewSize(ViewSize.Laptop);

  if (!isLaptop) {
    return <PlusMobileDrawer />;
  }

  return (
    <Modal className="!max-h-fit !w-fit" isOpen onRequestClose={() => {}}>
      <Modal.Body>
        {isExtension ? <PlusExtension /> : <PlusDesktop shouldShowPlusHeader />}
      </Modal.Body>
    </Modal>
  );
};

export default PlusModal;
