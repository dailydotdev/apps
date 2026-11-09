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
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
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
import {
  coreImage,
  getCoreCurrencyImage,
} from '@dailydotdev/shared/src/lib/image';
import type { CoresPurpose } from '../../flows/purchase/BuyCoresFixed';
import { NeededCopy } from '../../flows/purchase/BuyCoresFixed';
import friendshipArt from '../../assets/cores-checkout-friendship.png';
import { Row } from './kit';
import { Deals } from './Deals';
import { noop } from '../../real/providers';

// BuyCoresFixedModal (flows/purchase/BuyCoresFixed.tsx) in the redesign's
// line. Same packs, preselection, copy and actions; new: a "what it's for"
// card leads, packs are production's list, and the
// friendship art fills the right side until a pack is picked, then the
// checkout takes its place, as the Paddle iframe does in production.

/** Stands in for the Paddle iframe, which needs a client token */
const CheckoutStandIn = ({
  pack,
  onPay,
}: {
  pack?: { cores: number; price: string };
  onPay: () => void;
}): ReactElement => (
  <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Quaternary}
    >
      Paddle checkout opens here in production
    </Typography>
    <Row
      visual={
        <Image
          className="size-10"
          src={pack ? getCoreCurrencyImage(pack.cores) : coreImage}
          fallbackSrc={coreImage}
        />
      }
      title={pack ? `${formatCoresCurrency(pack.cores)} Cores` : 'Pick a pack'}
      meta={pack?.price}
    />
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

const CheckoutField = ({ label }: { label: string }): ReactElement => (
  <span className="flex flex-col gap-1">
    <span className="text-text-tertiary typo-caption1">{label}</span>
    <span className="h-10 rounded-10 border border-border-subtlest-tertiary bg-surface-float" />
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
  <div className="flex flex-1 flex-col gap-4 overflow-y-auto rounded-16 bg-background-default p-4">
    <CheckoutField label="Email" />
    <CheckoutField label="Card number" />
    <span className="grid grid-cols-2 gap-3">
      <CheckoutField label="Expiry date" />
      <CheckoutField label="Security code" />
    </span>
    <CheckoutField label="Country" />
    <div className="mt-auto">
      <CheckoutStandIn pack={pack} onPay={onPay} />
    </div>
  </div>
);

export interface BuyCoresRedesignModalProps {
  purpose: CoresPurpose;
  cost: number;
  product?: Product;
  onPay: (pack: CoreProductOption) => void;
  onRequestClose: () => void;
}

export const BuyCoresRedesignModal = ({
  purpose,
  cost,
  product,
  onPay,
  onRequestClose,
}: BuyCoresRedesignModalProps): ReactElement => {
  const { user, isLoggedIn } = useAuthContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const balance = user?.balance?.amount ?? 0;
  const missing = Math.max(0, cost - balance);
  const { data: prices } = useQuery(
    coresPricesQueryOptions({ user, isLoggedIn }),
  );
  const [selected, setSelected] = useState<CoreProductOption>();
  // The art shows until a pack is picked, then the checkout takes its place
  const [hasPicked, setHasPicked] = useState(false);
  const [isCheckoutOpen, setCheckoutOpen] = useState(!isMobile);
  const origin = purpose === 'award' ? Origin.Award : Origin.BoostPost;

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
      <NeededCopy
        purpose={purpose}
        cost={cost}
        balance={balance}
        awardName={product?.name}
        selected={selected}
      />
      <Deals withStartups={purpose === 'boost'} />
      <div>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Choose how many Cores to buy.
        </Typography>
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
                <CheckoutStandIn pack={pack} onPay={pay} />
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
            {hasPicked ? (
              <CheckoutPanel pack={pack} onPay={pay} />
            ) : (
              <FriendshipPanel />
            )}
          </div>
        </ModalBody>
      )}
    </Modal>
  );
};
