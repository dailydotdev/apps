import type { ReactElement } from 'react';
import React from 'react';
import dynamic from 'next/dynamic';
import { Modal } from '../modals/common/Modal';
import { checkIsExtension } from '../../lib/func';
import { useViewSize, ViewSize } from '../../hooks';
import { ModalClose } from '../modals/common/ModalClose';
import { useLazyModal } from '../../hooks/useLazyModal';
import { PaymentContextProvider } from '../../contexts/PaymentContext';

const PlusMobileDrawer = dynamic(
  () => import(/* webpackChunkName: "plusMobileDrawer" */ './PlusMobileDrawer'),
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
  const { closeModal } = useLazyModal();
  const isExtension = checkIsExtension();
  const isLaptop = useViewSize(ViewSize.Laptop);

  if (!isLaptop) {
    return <PlusMobileDrawer />;
  }

  return (
    <PaymentContextProvider>
      <Modal
        className="!max-h-fit !w-fit overflow-hidden !bg-background-default"
        isOpen
      >
        <Modal.Body className="!p-0">
          <ModalClose onClick={closeModal} top="4" />
          {isExtension ? (
            <PlusExtension />
          ) : (
            <PlusDesktop
              shouldShowPlusHeader
              className="!items-start !gap-0"
              plusInfoContainerClassName="pr-10 !pt-8"
              showPlusList={false}
              checkoutClassName={{
                container:
                  'border-top-0 border-r-0 border-b-0 border-t-0 h-full pl-10 !pt-8 ',
              }}
            />
          )}
        </Modal.Body>
      </Modal>
    </PaymentContextProvider>
  );
};

export default PlusModal;
