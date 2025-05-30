import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ModalProps } from '../modals/common/Modal';
import { Modal } from '../modals/common/Modal';
import { checkIsExtension, isIOSNative } from '../../lib/func';
import { useBoot, useViewSize, ViewSize } from '../../hooks';
import { ModalClose } from '../modals/common/ModalClose';
import { useLazyModal } from '../../hooks/useLazyModal';
import { PaymentContextProvider } from '../../contexts/payment';
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

const PlusIOS = dynamic(() =>
  import(/* webpackChunkName: "plusIOS" */ './PlusIOS').then(
    (mod) => mod.PlusIOS,
  ),
);

const PlusMarketingModal = (modalProps: ModalProps): ReactElement => {
  const { getMarketingCta, clearMarketingCta } = useBoot();
  const marketingCta = getMarketingCta(MarketingCtaVariant.Plus);
  const { campaignId } = marketingCta || {};
  const { logEvent } = useLogContext();
  const { closeModal } = useLazyModal();
  const isExtension = checkIsExtension();
  const isTablet = useViewSize(ViewSize.Tablet);

  const handleClose = () => {
    logEvent({
      event_name: LogEvent.MarketingCtaDismiss,
      target_type: TargetType.MarketingCtaPlus,
      target_id: campaignId,
    });
    closeModal();
    clearMarketingCta(campaignId);
  };

  const plusComponent = useMemo(() => {
    if (isIOSNative()) {
      return <PlusIOS showModalSection />;
    }
    return isExtension ? <PlusExtension /> : <PlusWebapp />;
  }, [isExtension]);

  if (!isTablet) {
    return <PlusMobileDrawer onClose={handleClose} {...modalProps} />;
  }

  return (
    <PaymentContextProvider>
      <Modal
        size={ModalSize.XLarge}
        className="flex-1 overflow-x-hidden !bg-background-default"
        {...modalProps}
        onRequestClose={handleClose}
      >
        <Modal.Body className="!p-0">
          <ModalClose onClick={handleClose} top="4" />
          {plusComponent}
        </Modal.Body>
      </Modal>
    </PaymentContextProvider>
  );
};

export default PlusMarketingModal;
