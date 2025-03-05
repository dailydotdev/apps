import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
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
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { CoinIcon } from '../../icons';

const CoreOptionButton = () => {
  const { onCompletion } = useBuyCoresContext();
  return (
    <Button
      className="w-full"
      variant={ButtonVariant.Float}
      icon={<CoinIcon />}
      size={ButtonSize.Large}
      onClick={onCompletion}
    >
      <Typography
        type={TypographyType.Body}
        color={TypographyColor.Primary}
        bold
      >
        100
      </Typography>
      <div className="flex-1" />
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="font-normal"
      >
        $0.99
      </Typography>
    </Button>
  );
};

const CoreOptions = () => {
  const { amountNeeded } = useBuyCoresContext();
  return (
    <div className="flex-1 ">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        <Typography
          tag={TypographyTag.Span}
          color={TypographyColor.Primary}
          bold
        >
          {amountNeeded} Cores
        </Typography>{' '}
        will be used to give the Award. The remaining{' '}
        <Typography
          tag={TypographyTag.Span}
          color={TypographyColor.Primary}
          bold
        >
          80 Cores
        </Typography>{' '}
        will be added to your balance.
      </Typography>
      <div className="mt-4 flex flex-col gap-2">
        <CoreOptionButton />
        <CoreOptionButton />
        <CoreOptionButton />
        <CoreOptionButton />
        <CoreOptionButton />
        <CoreOptionButton />
        <CoreOptionButton />
        <CoreOptionButton />
        <CoreOptionButton />
      </div>
    </div>
  );
};

const Checkout = () => {
  return <div className="flex-1">Checkout</div>;
};

const Processing = () => {
  return <div>Processing</div>;
};

const BuyCoresMobile = () => {
  return (
    <ModalBody>
      <CoreOptions />
    </ModalBody>
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

type BuyCoresModalProps = {
  onCompletion?: () => void;
} & ModalProps;
export const BuyCoresModal = ({
  props,
  onCompletion,
}: BuyCoresModalProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);

  return (
    <BuyCoresContextProvider amountNeeded={40} onCompletion={onCompletion}>
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
              onClick={onRequestClose}
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              className="mr-2"
            >
              Close
            </Button>
          ) : null}
          <ModalClose top="2" />
        </Modal.Header>
        {isMobile ? <BuyCoresMobile /> : <BuyCoreDesktop />}
      </Modal>
    </BuyCoresContextProvider>
  );
};
