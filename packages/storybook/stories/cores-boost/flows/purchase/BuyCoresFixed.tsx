import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import type { Paddle } from '@paddle/paddle-js';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { ModalBody } from '@dailydotdev/shared/src/components/modals/common/ModalBody';
import { ModalKind } from '@dailydotdev/shared/src/components/modals/common/types';
import { BuyCreditsButton } from '@dailydotdev/shared/src/components/credit/BuyCreditsButton';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons/Core';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { CoreOptionList } from '@dailydotdev/shared/src/components/cores/CoreOptionList';
import { getRecommendedCorePrice } from '@dailydotdev/shared/src/components/cores/recommendedCorePrice';
import type {
  BuyCoresContextData,
  CoreProductOption,
} from '@dailydotdev/shared/src/contexts/BuyCoresContext/types';
import { BuyCoresContext } from '@dailydotdev/shared/src/contexts/BuyCoresContext/types';
import { coresPricesQueryOptions } from '@dailydotdev/shared/src/graphql/njord';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
import { walletUrl } from '@dailydotdev/shared/src/lib/constants';
import { noop } from '../../real/providers';

// Fixed copy of BuyCoresModal (components/modals/award/BuyCoresModal.tsx).
// Changed: the smallest pack covering the shortfall is preselected on every
// width, the copy names what the Cores are for (award or boost) and counts the
// balance, the header "+" works, and a timeout keeps the user in the modal.

export type CoresPurpose = 'award' | 'boost';

/** Stands in for the Paddle iframe, which needs a client token */
export const CheckoutStandIn = ({
  pack,
  onPay,
  className,
}: {
  pack?: { cores: number; price: string };
  onPay: () => void;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-1 flex-col justify-center gap-4 rounded-16 border border-dashed border-border-subtlest-secondary p-6',
      className,
    )}
  >
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Quaternary}
    >
      Paddle checkout opens here in production
    </Typography>
    <Typography type={TypographyType.Title3} bold>
      {pack ? `${formatCoresCurrency(pack.cores)} Cores` : 'Pick a pack'}
    </Typography>
    <Button
      variant={ButtonVariant.Primary}
      disabled={!pack}
      onClick={onPay}
      className="w-full"
    >
      Pay {pack?.price}
    </Button>
  </div>
);

const NeededCopy = ({
  purpose,
  cost,
  balance,
  awardName,
  selected,
}: {
  purpose: CoresPurpose;
  cost: number;
  balance: number;
  awardName?: string;
  selected?: CoreProductOption;
}): ReactElement => {
  const target =
    purpose === 'award' ? (awardName ?? 'the Award') : 'your boost';
  const missing = cost - balance;

  if (!selected || selected.value < missing) {
    return (
      <Typography
        className="w-full flex-1"
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        You need{' '}
        <strong className="text-text-primary">
          {formatCoresCurrency(missing)} more Cores
        </strong>{' '}
        {purpose === 'award' ? `to send ${target}.` : 'to boost the post.'}
      </Typography>
    );
  }

  return (
    <Typography
      className="w-full flex-1"
      type={TypographyType.Callout}
      color={TypographyColor.Secondary}
    >
      <Typography tag={TypographyTag.Span} color={TypographyColor.Primary} bold>
        Covers your {purpose}.
      </Typography>{' '}
      {formatCoresCurrency(cost)} Cores go to {target}, and{' '}
      <Typography tag={TypographyTag.Span} color={TypographyColor.Primary} bold>
        {formatCoresCurrency(balance + selected.value - cost)}
      </Typography>{' '}
      stay in your balance.
    </Typography>
  );
};

export interface BuyCoresFixedModalProps {
  purpose: CoresPurpose;
  /** What the award or boost costs */
  cost: number;
  awardName?: string;
  onPay: (pack: CoreProductOption) => void;
  onRequestClose: () => void;
}

export const BuyCoresFixedModal = ({
  purpose,
  cost,
  awardName,
  onPay,
  onRequestClose,
}: BuyCoresFixedModalProps): ReactElement => {
  const { user, isLoggedIn } = useAuthContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const balance = user?.balance?.amount ?? 0;
  const missing = Math.max(0, cost - balance);
  const { data: prices } = useQuery(
    coresPricesQueryOptions({ user, isLoggedIn }),
  );
  const [selectedProduct, setSelectedProduct] = useState<CoreProductOption>();
  const [isCheckoutOpen, setCheckoutOpen] = useState(!isMobile);

  useEffect(() => {
    const recommended = getRecommendedCorePrice({ prices, minCores: missing });
    if (!recommended || selectedProduct) {
      return;
    }
    setSelectedProduct({
      id: recommended.priceId,
      value: recommended.metadata.coresValue ?? 0,
    });
  }, [prices, missing, selectedProduct]);

  const pack = useMemo(() => {
    const price = prices?.find(
      ({ priceId }) => priceId === selectedProduct?.id,
    );
    return price && selectedProduct
      ? { cores: selectedProduct.value, price: price.price.formatted }
      : undefined;
  }, [prices, selectedProduct]);

  const context: BuyCoresContextData = {
    paddle: {} as Paddle,
    openCheckout: () => setCheckoutOpen(true),
    amountNeeded: cost,
    minCoresToBuy: missing,
    selectedProduct,
    setSelectedProduct,
    activeStep: 'INTRO',
    setActiveStep: noop,
    origin: purpose === 'award' ? Origin.Award : Origin.BoostPost,
  };

  const onPlusClick = () =>
    document
      .querySelector<HTMLElement>('[role="radiogroup"] [aria-checked="true"]')
      ?.focus();

  const pay = () => selectedProduct && onPay(selectedProduct);

  const options: ReactNode = (
    <div className={classNames('flex-1', !isMobile && 'p-6')}>
      <NeededCopy
        purpose={purpose}
        cost={cost}
        balance={balance}
        awardName={awardName}
        selected={selectedProduct}
      />
      <CoreOptionList />
    </div>
  );

  return (
    <BuyCoresContext.Provider value={context}>
      <Modal
        isOpen
        onRequestClose={onRequestClose}
        kind={isMobile ? ModalKind.FlexibleTop : Modal.Kind.FlexibleCenter}
        size={Modal.Size.XLarge}
        className={classNames(!isMobile ? '!h-[40rem]' : undefined)}
      >
        <Modal.Header
          title={!isMobile ? 'Get More Cores' : undefined}
          className="mr-auto flex-row-reverse justify-between gap-4 laptop:justify-end"
          showCloseButton={!isMobile}
        >
          <BuyCreditsButton onPlusClick={onPlusClick} origin={context.origin} />
          {isMobile && (
            <Button
              onClick={onRequestClose}
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              className="mr-2"
            >
              Close
            </Button>
          )}
        </Modal.Header>
        {isMobile ? (
          <>
            <ModalBody className="bg-gradient-to-t from-theme-overlay-float-bun to-transparent">
              {isCheckoutOpen ? (
                <CheckoutStandIn pack={pack} onPay={pay} />
              ) : (
                options
              )}
            </ModalBody>
            {!isCheckoutOpen && (
              <Modal.Footer>
                <Button
                  variant={ButtonVariant.Primary}
                  className="w-full"
                  disabled={!pack}
                  onClick={() => setCheckoutOpen(true)}
                >
                  Buy {pack ? formatCoresCurrency(pack.cores) : ''} Cores
                </Button>
              </Modal.Footer>
            )}
          </>
        ) : (
          <ModalBody className="bg-gradient-to-t from-theme-overlay-float-bun to-transparent !p-0 tablet:rounded-b-16">
            <div className="flex flex-1 flex-row">
              {options}
              <div className="flex flex-1 p-6">
                <CheckoutStandIn pack={pack} onPay={pay} />
              </div>
            </div>
          </ModalBody>
        )}
      </Modal>
    </BuyCoresContext.Provider>
  );
};

export type ProcessingState = 'processing' | 'timeout';

/** Fixed copy of BuyCoresProcessing: a timeout stays here with Check again */
export const BuyCoresProcessingFixed = ({
  state,
  draftName,
  onCheckAgain,
  onRequestClose,
}: {
  state: ProcessingState;
  /** What the user was buying for, kept while the payment settles */
  draftName: string;
  onCheckAgain: () => void;
  onRequestClose: () => void;
}): ReactElement => (
  <Modal
    isOpen
    kind={Modal.Kind.FlexibleCenter}
    size={Modal.Size.XSmall}
    onRequestClose={onRequestClose}
    isDrawerOnMobile
  >
    <Modal.Body className="flex items-center justify-center gap-4 text-center">
      <CoreIcon size={IconSize.XXXLarge} />
      {state === 'processing' ? (
        <>
          <Typography type={TypographyType.Title3} bold>
            Processing your payment, please wait...
          </Typography>
          <Loader className="hidden tablet:block" />
        </>
      ) : (
        <>
          <Typography type={TypographyType.Title3} bold>
            Still processing…
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Payments usually land in under a minute. {draftName} is saved, and
            we pick it up as soon as your Cores arrive.
          </Typography>
          <Button
            onClick={onCheckAgain}
            variant={ButtonVariant.Primary}
            className="w-full"
          >
            Check again
          </Button>
          <a href={walletUrl} target="_blank" rel="noreferrer">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              <u>Check the status in your wallet</u>
            </Typography>
          </a>
        </>
      )}
    </Modal.Body>
  </Modal>
);
