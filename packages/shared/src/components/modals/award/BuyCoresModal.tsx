import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { ModalKind } from '../common/types';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { useViewSize, ViewSize } from '../../../hooks';
import { ModalBody } from '../common/ModalBody';
import {
  BuyCoresContextProvider,
  useBuyCoresContext,
} from '../../../contexts/BuyCoresContext';
import { BuyCreditsButton } from '../../credit/BuyCreditsButton';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ModalClose } from '../common/ModalClose';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { CoinIcon } from '../../icons';
import { useGiveAwardModalContext } from '../../../contexts/GiveAwardModalContext';
import { IconSize } from '../../Icon';
import useDebounceFn from '../../../hooks/useDebounceFn';
import { CoreOptionList } from '../../cores/CoreOptionList';
import { CoreAmountNeeded } from '../../cores/CoreAmountNeeded';
import type { Origin } from '../../../lib/log';

const CoreOptions = () => {
  return (
    <div className="flex-1 ">
      <CoreAmountNeeded />
      <CoreOptionList />
    </div>
  );
};

const Checkout = () => {
  const { setActiveStep } = useBuyCoresContext();
  return (
    <div className="flex-1">
      <div className="checkout-container" />
      <Button onClick={() => setActiveStep('PROCESSING')}>
        Complete purchase
      </Button>
    </div>
  );
};

const ProcessingLoading = () => {
  return (
    <>
      <CoinIcon size={IconSize.XXXLarge} />
      <Typography type={TypographyType.Title3} bold>
        Processing your payment
      </Typography>
    </>
  );
};

const ProcessingCompleted = () => {
  const { onCompletion } = useBuyCoresContext();

  return (
    <>
      <CoinIcon size={IconSize.XXXLarge} />
      <Typography type={TypographyType.Body} bold>
        200
      </Typography>
      <Typography type={TypographyType.Title3} bold>
        You got your Cores!
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Success! Your Cores are now available in your balance.
      </Typography>
      <Button
        onClick={onCompletion}
        variant={ButtonVariant.Primary}
        className="w-full"
      >
        Got it
      </Button>
    </>
  );
};

const Processing = ({ ...props }: ModalProps): ReactElement => {
  const { onCompletion } = useBuyCoresContext();
  const [isProcessing, setIsProcessing] = useState(true);

  const [cb] = useDebounceFn(() => setIsProcessing(false), 1500);
  cb();

  return (
    <Modal
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XSmall}
      {...props}
      onRequestClose={onCompletion}
      isDrawerOnMobile
    >
      <Modal.Body className="flex items-center gap-4 text-center">
        {isProcessing ? <ProcessingLoading /> : <ProcessingCompleted />}
      </Modal.Body>
    </Modal>
  );
};

const BuyCoresMobile = () => {
  const { selectedProduct, openCheckout } = useBuyCoresContext();

  useEffect(() => {
    if (selectedProduct) {
      openCheckout({ priceId: selectedProduct });
    }
  }, [openCheckout, selectedProduct]);

  return (
    <ModalBody>{selectedProduct ? <Checkout /> : <CoreOptions />}</ModalBody>
  );
};

const BuyCoreDesktop = () => {
  return (
    <ModalBody>
      <div className="flex flex-row gap-12">
        <CoreOptions />
        <Checkout />
      </div>
    </ModalBody>
  );
};

const BuyFlow = ({ ...props }: ModalProps): ReactElement => {
  const { setActiveModal } = useGiveAwardModalContext();
  const isMobile = useViewSize(ViewSize.MobileL);

  return (
    <Modal
      kind={isMobile ? ModalKind.FlexibleTop : Modal.Kind.FlexibleCenter}
      size={Modal.Size.XLarge}
      className={classNames(!isMobile ? '!h-[40rem]' : undefined)}
      {...props}
    >
      <Modal.Header
        title="Get more Cores"
        className="mr-auto flex-row-reverse justify-end gap-4"
      >
        <BuyCreditsButton
          hideBuyButton
          onPlusClick={() => setActiveModal('BUY_CORES')}
        />
        {isMobile ? (
          <Button
            onClick={props.onRequestClose}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            className="mr-2"
          >
            Close
          </Button>
        ) : null}
        <ModalClose onClick={props.onRequestClose} top="2" />
      </Modal.Header>
      {isMobile ? <BuyCoresMobile /> : <BuyCoreDesktop />}
    </Modal>
  );
};

const ModalRender = ({ ...props }: ModalProps) => {
  const { activeStep } = useBuyCoresContext();

  if (activeStep === 'PROCESSING') {
    return <Processing {...props} />;
  }
  if (activeStep === 'INTRO') {
    return <BuyFlow {...props} />;
  }
  return null;
};

type BuyCoresModalProps = ModalProps & {
  origin: Origin;
  onCompletion?: () => void;
};
export const BuyCoresModal = ({
  origin,
  onCompletion,
  ...props
}: BuyCoresModalProps): ReactElement => {
  return (
    <BuyCoresContextProvider
      amountNeeded={40}
      onCompletion={onCompletion}
      origin={origin}
    >
      <ModalRender {...props} />
    </BuyCoresContextProvider>
  );
};
