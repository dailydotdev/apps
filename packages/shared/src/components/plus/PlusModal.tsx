import type { ReactElement } from 'react';
import React from 'react';
import dynamic from 'next/dynamic';
import { Modal } from '../modals/common/Modal';
import { checkIsExtension } from '../../lib/func';
import { useViewSize, ViewSize } from '../../hooks';

const PlusMobileDrawer = dynamic(() =>
  import(/* webpackChunkName: "plusMobileDrawer" */ './PlusMobile').then(
    (mod) => mod.PlusMobile,
  ),
);

const PlusExtension = dynamic(
  () => import(/* webpackChunkName: "plusExtension" */ './PlusExtension'),
);

const PlusDesktop = dynamic(() =>
  import(/* webpackChunkName: "plusDesktop" */ './PlusDesktop').then(
    (mod) => mod.PlusDesktop,
  ),
);

const PlusModal = (): ReactElement => {
  const isExtension = checkIsExtension();
  const isLaptop = useViewSize(ViewSize.Laptop);

  if (!isLaptop) {
    return <PlusMobileDrawer />;
  }

  return (
    <Modal className="!max-h-fit !w-fit overflow-hidden" isOpen>
      <Modal.Body className={isExtension && '!p-0'}>
        {isExtension ? <PlusExtension /> : <PlusDesktop shouldShowPlusHeader />}
      </Modal.Body>
    </Modal>
  );
};

export default PlusModal;
