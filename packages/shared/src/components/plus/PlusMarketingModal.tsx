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
import type { TypographyColor } from '../typography/Typography';
import { IconSize } from '../Icon';
import { TypographyType } from '../typography/Typography';
import { PlusUser } from '../PlusUser';
import { plusRedBackgroundImage } from '../../lib/image';
import { PlusList } from './PlusList';
import { Image } from '../image/Image';

const PlusMobileDrawer = dynamic(
  () => import(/* webpackChunkName: "plusMobileDrawer" */ './PlusMobileDrawer'),
);

const PlusExtension = dynamic(
  () => import(/* webpackChunkName: "plusExtension" */ './PlusExtension'),
);

const PlusWebapp = dynamic(
  () => import(/* webpackChunkName: "plusWebapp" */ './PlusWebapp'),
);

export const PlusListModal = (): ReactElement => {
  return (
    <div className="relative flex h-full flex-1 flex-col gap-8 bg-black pr-6">
      <PlusUser
        iconSize={IconSize.Large}
        typographyType={TypographyType.Title1}
        className="invisible"
        aria-hidden
      />
      <Image className="absolute bottom-0" src={plusRedBackgroundImage} />
      <PlusList
        typographyProps={{
          color: 'text-white' as TypographyColor,
        }}
        iconProps={{
          className: 'text-white',
        }}
        className="z-1 pl-10"
      />
    </div>
  );
};

const PlusMarketingModal = (modalProps: ModalProps): ReactElement => {
  const { getMarketingCta, clearMarketingCta } = useBoot();
  const marketingCta = getMarketingCta(MarketingCtaVariant.Plus);
  const { campaignId } = marketingCta;
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
    clearMarketingCta(campaignId);
    closeModal();
  };

  if (!isTablet) {
    return <PlusMobileDrawer onClose={handleClose} {...modalProps} />;
  }

  return (
    <PaymentContextProvider>
      <Modal
        size={ModalSize.XLarge}
        className="!h-full overflow-x-hidden !bg-background-default"
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
