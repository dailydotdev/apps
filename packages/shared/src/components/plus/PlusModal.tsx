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
import type { MarketingCta } from '../marketingCta/common';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';

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

type PlusModalProps = ModalProps & {
  marketingCta: MarketingCta;
};

const PlusModal = ({
  marketingCta,
  ...modalProps
}: PlusModalProps): ReactElement => {
  const { campaignId } = marketingCta;
  const { clearMarketingCta } = useBoot();
  const { logEvent } = useLogContext();
  const { closeModal } = useLazyModal();
  const isExtension = checkIsExtension();
  const isLaptop = useViewSize(ViewSize.Laptop);

  const handleClose = () => {
    logEvent({
      event_name: LogEvent.MarketingCtaDismiss,
      target_type: TargetType.MarketingCtaPlus,
      target_id: campaignId,
    });
    clearMarketingCta(campaignId);
    closeModal();
  };

  if (!isLaptop) {
    return (
      <PlusMobileDrawer
        onClose={handleClose}
        marketingCta={marketingCta}
        {...modalProps}
      />
    );
  }

  return (
    <PaymentContextProvider>
      <Modal
        className="!max-h-fit !w-fit overflow-hidden !bg-background-default"
        {...modalProps}
      >
        <Modal.Body className="!p-0">
          <ModalClose onClick={handleClose} top="4" />
          {isExtension ? (
            <PlusExtension marketingCta={marketingCta} />
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
