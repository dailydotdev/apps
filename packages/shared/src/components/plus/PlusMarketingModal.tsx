import type { ReactElement } from 'react';
import React from 'react';
import dynamic from 'next/dynamic';
import type { ModalProps } from '../modals/common/Modal';
import { Modal } from '../modals/common/Modal';
import { checkIsExtension } from '../../lib/func';
import { useBoot, useViewSize, ViewSize } from '../../hooks';
import { ModalClose } from '../modals/common/ModalClose';
import { useLazyModal } from '../../hooks/useLazyModal';
import { PaymentContextProvider } from '../../contexts/PaymentContext';
import { MarketingCtaVariant } from '../marketingCta/common';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import { ModalSize } from '../modals/common/types';

const PlusMobileDrawer = dynamic(
  () => import(/* webpackChunkName: "plusMobileDrawer" */ './PlusMobileDrawer'),
);

const PlusExtension = dynamic(
  () => import(/* webpackChunkName: "plusExtension" */ './PlusExtension'),
);

const PlusWebapp = dynamic(
  () => import(/* webpackChunkName: "plusWebapp" */ './PlusWebapp'),
);

const PlusMarketingModal = (modalProps: ModalProps): ReactElement => {
  const { getMarketingCta, clearMarketingCta } = useBoot();
  const marketingCta = getMarketingCta(MarketingCtaVariant.Plus);
  const { campaignId } = marketingCta;
  const { logEvent } = useLogContext();
  const { closeModal } = useLazyModal();
  const isExtension = checkIsExtension();
  const isMobile = useViewSize(ViewSize.MobileL);

  const handleClose = () => {
    logEvent({
      event_name: LogEvent.MarketingCtaDismiss,
      target_type: TargetType.MarketingCtaPlus,
      target_id: campaignId,
    });
    clearMarketingCta(campaignId);
    closeModal();
  };

  if (isMobile) {
    return <PlusMobileDrawer onClose={handleClose} {...modalProps} />;
  }

  return (
    <PaymentContextProvider>
      <Modal
        size={ModalSize.XLarge}
        className="!bg-background-default"
        {...modalProps}
        onRequestClose={handleClose}
      >
        <Modal.Body className="!p-0">
          <ModalClose onClick={handleClose} top="4" />
          {isExtension ? <PlusExtension /> : <PlusWebapp />}
        </Modal.Body>
      </Modal>
    </PaymentContextProvider>
  );
};

export default PlusMarketingModal;
