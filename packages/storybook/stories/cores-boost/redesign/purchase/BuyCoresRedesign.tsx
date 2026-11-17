import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import type { Paddle } from '@paddle/paddle-js';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { ModalBody } from '@dailydotdev/shared/src/components/modals/common/ModalBody';
import { ModalKind } from '@dailydotdev/shared/src/components/modals/common/types';
import { BuyCreditsButton } from '@dailydotdev/shared/src/components/credit/BuyCreditsButton';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  CreditCardIcon,
  PlusIcon,
} from '@dailydotdev/shared/src/components/icons';
import { getRecommendedCorePrice } from '@dailydotdev/shared/src/components/cores/recommendedCorePrice';
import type {
  BuyCoresContextData,
  CoreProductOption,
} from '@dailydotdev/shared/src/contexts/BuyCoresContext/types';
import { BuyCoresContext } from '@dailydotdev/shared/src/contexts/BuyCoresContext/types';
import { CoreOptionList } from '@dailydotdev/shared/src/components/cores/CoreOptionList';
import { coresPricesQueryOptions } from '@dailydotdev/shared/src/graphql/njord';
import type { Product } from '@dailydotdev/shared/src/graphql/njord';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
import type { CoresPurpose } from '../../flows/purchase/BuyCoresFixed';
import { NeededCopy } from '../../flows/purchase/BuyCoresFixed';
import friendshipArt from '../../assets/cores-checkout-friendship.png';
import { Deals } from './Deals';
import { noop } from '../../real/providers';

// BuyCoresFixedModal (flows/purchase/BuyCoresFixed.tsx) in the redesign's
// line. Same packs, preselection, copy and actions; new: a "what it's for"
// card leads, packs are production's list, and the
// friendship art fills the right side until a pack is picked, then the
// checkout takes its place, as the Paddle iframe does in production.

/** The friendship art that stood in for the checkout video */
const FriendshipPanel = ({ children }: { children?: ReactNode }) => (
  <div className="flex flex-1 flex-col overflow-hidden rounded-16 bg-background-default">
    <div className="relative min-h-0 flex-1">
      <img
        src={friendshipArt}
        alt="Friends passing a Core"
        className="absolute inset-0 h-full w-full object-cover object-[50%_70%]"
      />
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background-default to-transparent" />
    </div>
    {children && <div className="p-4">{children}</div>}
  </div>
);

const CheckoutField = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}): ReactElement => (
  <span className="flex flex-col gap-1.5">
    <span className="typo-footnote">{label}</span>
    <span className="flex h-11 items-center rounded-10 border border-border-subtlest-secondary bg-surface-float px-3 text-text-quaternary typo-callout">
      {children}
    </span>
  </span>
);

/** Where the Paddle checkout takes over the art once a pack is picked */
const CheckoutPanel = ({
  pack,
  onPay,
}: {
  pack?: { cores: number; price: string };
  onPay: () => void;
}): ReactElement => (
  <div className="flex min-w-0 flex-1 flex-col overflow-y-auto rounded-16 bg-background-default p-4">
    <PaddleCheckout pack={pack} onPay={onPay} />
  </div>
);

/** Production's Paddle checkout form, drawn: the iframe needs a client token */
const PaddleCheckout = ({
  pack,
  onPay,
}: {
  pack?: { cores: number; price: string };
  onPay: () => void;
}): ReactElement => (
  <div className="flex flex-col gap-4">
    <span className="flex h-12 items-center justify-center rounded-12 bg-surface-primary font-bold text-surface-invert typo-title3">
      G Pay
    </span>
    <span className="flex items-center gap-3 text-text-secondary typo-callout">
      <span className="h-px flex-1 bg-border-subtlest-tertiary" />
      Or pay by card
      <span className="h-px flex-1 bg-border-subtlest-tertiary" />
    </span>
    <span className="grid grid-cols-2 gap-3">
      <span className="flex flex-col gap-2 rounded-10 border-2 border-accent-avocado-default bg-surface-float p-3 text-text-secondary typo-callout">
        <CreditCardIcon />
        Card
      </span>
      <span className="flex flex-col gap-2 rounded-10 border border-border-subtlest-secondary bg-surface-float p-3 text-text-secondary typo-callout">
        <strong className="flex size-6 items-center justify-center rounded-4 bg-surface-primary text-accent-blueCheese-default typo-caption1">
          P
        </strong>
        PayPal
      </span>
    </span>
    <CheckoutField label="Name on card">Cardholder name</CheckoutField>
    <span className="flex flex-col gap-1.5">
      <span className="typo-footnote">Card details</span>
      <span className="flex flex-col rounded-10 border border-border-subtlest-secondary bg-surface-float text-text-quaternary typo-callout">
        <span className="flex h-11 items-center justify-between gap-2 border-b border-border-subtlest-secondary px-3">
          XXXX XXXX XXXX XXXX
          <span className="flex gap-1 font-bold typo-caption2">
            {['VISA', 'MC', 'AMEX', 'DISC'].map((brand) => (
              <span
                key={brand}
                className="rounded-4 bg-surface-primary px-1 text-surface-invert"
              >
                {brand}
              </span>
            ))}
          </span>
        </span>
        <span className="grid h-11 grid-cols-2 divide-x divide-border-subtlest-secondary">
          <span className="flex items-center px-3">MM / YY</span>
          <span className="flex items-center px-3">CVV</span>
        </span>
      </span>
    </span>
    <span className="flex flex-col divide-y divide-border-subtlest-tertiary border-y border-border-subtlest-tertiary text-accent-blueCheese-default typo-callout">
      {['Add VAT number', 'Add discount code'].map((label) => (
        <span key={label} className="flex items-center justify-between py-3">
          {label}
          <PlusIcon />
        </span>
      ))}
    </span>
    <span className="flex items-start gap-3 rounded-10 bg-surface-float p-3 typo-footnote">
      <span className="mt-0.5 size-5 shrink-0 rounded-6 bg-surface-secondary" />
      <span className="min-w-0 flex-1">
        <strong>Save my card details for a faster checkout</strong> with Daily
        Dev Ltd next time
      </span>
    </span>
    <Button
      variant={ButtonVariant.Primary}
      color={ButtonColor.Bacon}
      size={ButtonSize.Large}
      disabled={!pack}
      onClick={onPay}
      className="w-full"
    >
      Pay {pack?.price}
    </Button>
    <span className="text-center text-text-tertiary typo-caption2">
      Sold by Paddle. Provided by Daily Dev Ltd.
      <span className="mt-1 flex justify-center gap-3 underline">
        <span>Support</span>
        <span>Terms</span>
        <span>Privacy</span>
      </span>
    </span>
  </div>
);

export interface BuyCoresRedesignModalProps {
  /** What the Cores are for; unset when you buy from the wallet */
  purpose?: CoresPurpose;
  cost: number;
  product?: Product;
  /** Open on the checkout, as after picking a pack */
  isCheckoutShown?: boolean;
  onPay: (pack: CoreProductOption) => void;
  onRequestClose: () => void;
}

export const BuyCoresRedesignModal = ({
  purpose,
  cost,
  product,
  isCheckoutShown = false,
  onPay,
  onRequestClose,
}: BuyCoresRedesignModalProps): ReactElement => {
  const { user, isLoggedIn } = useAuthContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const balance = user?.balance?.amount ?? 0;
  const missing = Math.max(0, cost - balance);
  const { data: prices } = useQuery(
    coresPricesQueryOptions({ user, isLoggedIn }),
  );
  const [selected, setSelected] = useState<CoreProductOption>();
  // The art shows until a pack is picked, then the checkout takes its place
  const [hasPicked, setHasPicked] = useState(isCheckoutShown);
  const [isCheckoutOpen, setCheckoutOpen] = useState(
    !isMobile || isCheckoutShown,
  );
  const origins: Record<CoresPurpose, Origin> = {
    award: Origin.Award,
    boost: Origin.BoostPost,
  };
  const origin = purpose ? origins[purpose] : Origin.WalletPageCTA;

  useEffect(() => {
    const recommended = getRecommendedCorePrice({ prices, minCores: missing });
    if (!recommended || selected) {
      return;
    }
    setSelected({
      id: recommended.priceId,
      value: recommended.metadata.coresValue ?? 0,
    });
  }, [prices, missing, selected]);

  const pack = useMemo(() => {
    const price = prices?.find(({ priceId }) => priceId === selected?.id);
    return price && selected
      ? { cores: selected.value, price: price.price.formatted }
      : undefined;
  }, [prices, selected]);

  const onPlusClick = () =>
    document
      .querySelector<HTMLElement>('[role="radiogroup"] [aria-checked="true"]')
      ?.focus();

  const pay = () => selected && onPay(selected);

  // Production's pack list. It needs a Paddle to enable its packs and
  // preselects on its own, so the checkout opens on a real click instead
  const packsContext: BuyCoresContextData = {
    paddle: {} as Paddle,
    openCheckout: noop,
    amountNeeded: cost,
    minCoresToBuy: missing,
    selectedProduct: selected,
    setSelectedProduct: setSelected,
    activeStep: 'INTRO',
    setActiveStep: noop,
    origin,
  };

  const options = (
    <div className="flex flex-col gap-4">
      {purpose && (
        <NeededCopy
          purpose={purpose}
          cost={cost}
          balance={balance}
          awardName={product?.name}
          selected={selected}
        />
      )}
      <Deals
        withStartups={purpose !== 'award'}
        isSingleColumn={hasPicked && !isLaptop}
      />
      <div>
        <h3 className="mb-2 font-bold typo-callout">Packages</h3>
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
        <div
          onClickCapture={(event) => {
            if ((event.target as HTMLElement).closest('[role="radio"]')) {
              setHasPicked(true);
            }
          }}
        >
          <BuyCoresContext.Provider value={packsContext}>
            <CoreOptionList />
          </BuyCoresContext.Provider>
        </div>
      </div>
    </div>
  );

  return (
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
        <BuyCreditsButton onPlusClick={onPlusClick} origin={origin} />
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
          <ModalBody className="gap-4">
            {isCheckoutOpen ? (
              <>
                <img
                  src={friendshipArt}
                  alt="Friends passing a Core"
                  className="h-40 w-full rounded-16 object-cover object-[50%_35%]"
                />
                <PaddleCheckout pack={pack} onPay={pay} />
              </>
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
        <ModalBody className="!p-0 tablet:rounded-b-16">
          <div className="flex min-h-0 flex-1 flex-row gap-4 p-4">
            <div className="min-w-0 flex-1 overflow-y-auto pr-1">{options}</div>
            {hasPicked && <CheckoutPanel pack={pack} onPay={pay} />}
            {!hasPicked && isLaptop && <FriendshipPanel />}
          </div>
        </ModalBody>
      )}
    </Modal>
  );
};
