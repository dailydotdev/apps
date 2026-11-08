import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
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
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { getRecommendedCorePrice } from '@dailydotdev/shared/src/components/cores/recommendedCorePrice';
import type { CoreProductOption } from '@dailydotdev/shared/src/contexts/BuyCoresContext/types';
import { coresPricesQueryOptions } from '@dailydotdev/shared/src/graphql/njord';
import type { Product } from '@dailydotdev/shared/src/graphql/njord';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
import { walletUrl } from '@dailydotdev/shared/src/lib/constants';
import {
  coreImage,
  getCoreCurrencyImage,
} from '@dailydotdev/shared/src/lib/image';
import type { CoresPurpose } from '../../flows/purchase/BuyCoresFixed';
import { NeededCopy } from '../../flows/purchase/BuyCoresFixed';
import friendshipArt from '../../assets/cores-checkout-friendship.png';
import { CoreHalo, Row } from './kit';
import { StartupsBuyCoresPromo } from '@dailydotdev/shared/src/features/squads/components/promos/StartupsPromo';

// BuyCoresFixedModal (flows/purchase/BuyCoresFixed.tsx) in the redesign's
// line. Same packs, preselection, copy and actions; new: a "what it's for"
// card leads, packs are calm rows that say whether they cover it, and the
// friendship art replaces the two-hands video beside the checkout.

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

const PackList = ({
  minCores,
  selected,
  onSelect,
}: {
  minCores: number;
  selected?: CoreProductOption;
  onSelect: (pack: CoreProductOption) => void;
}): ReactElement => {
  const { user, isLoggedIn } = useAuthContext();
  const { data: prices, isPending } = useQuery(
    coresPricesQueryOptions({ user, isLoggedIn }),
  );
  const recommended = getRecommendedCorePrice({ prices, minCores });

  return (
    <ul className="flex flex-col gap-1" role="radiogroup">
      {isPending &&
        Array.from({ length: 6 }).map((_, index) => (
          <li
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="h-14 animate-pulse rounded-14 bg-surface-float"
          />
        ))}
      {prices?.map((price) => {
        const cores = price.metadata.coresValue ?? 0;
        const isSelected = selected?.id === price.priceId;
        const isRecommended = price.priceId === recommended?.priceId;
        const isNotEnough = !!minCores && cores < minCores;

        return (
          <li key={price.priceId}>
            <button
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect({ id: price.priceId, value: cores })}
              className={classNames(
                'flex w-full items-center gap-3 rounded-14 border px-3 py-2 text-left transition-colors',
                isSelected
                  ? 'border-action-cores-default bg-action-cores-float'
                  : 'border-transparent hover:bg-surface-hover',
                isNotEnough && !isSelected && 'opacity-64',
              )}
            >
              <Image
                className="size-9"
                src={getCoreCurrencyImage(cores)}
                fallbackSrc={coreImage}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <Typography type={TypographyType.Subhead} bold>
                  {price.metadata.title}
                </Typography>
                {isRecommended && (
                  <Typography
                    type={TypographyType.Caption1}
                    className="text-action-cores-default"
                    bold
                  >
                    Recommended
                  </Typography>
                )}
              </div>
              <Typography
                type={TypographyType.Callout}
                color={
                  isSelected
                    ? TypographyColor.Primary
                    : TypographyColor.Tertiary
                }
                bold={isSelected}
              >
                {price.price.formatted}
              </Typography>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

/** The friendship art that stood in for the checkout video */
const FriendshipPanel = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-1 flex-col overflow-hidden rounded-16 bg-background-default">
    <div className="relative min-h-0 flex-1">
      <img
        src={friendshipArt}
        alt="Friends passing a Core"
        className="absolute inset-0 h-full w-full object-cover object-[50%_70%]"
      />
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background-default to-transparent" />
    </div>
    <div className="p-4">{children}</div>
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

  const options = (
    <div className="flex flex-col gap-4">
      <NeededCopy
        purpose={purpose}
        cost={cost}
        balance={balance}
        awardName={product?.name}
        selected={selected}
      />
      {purpose === 'boost' && <StartupsBuyCoresPromo />}
      <div className="flex flex-col gap-2">
        <Typography type={TypographyType.Callout} bold>
          Choose how many Cores to buy
        </Typography>
        <PackList
          minCores={missing}
          selected={selected}
          onSelect={setSelected}
        />
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
            <FriendshipPanel>
              <CheckoutStandIn pack={pack} onPay={pay} />
            </FriendshipPanel>
          </div>
        </ModalBody>
      )}
    </Modal>
  );
};

export type ProcessingState = 'processing' | 'timeout';

/** BuyCoresProcessingFixed in the redesign's line */
export const BuyCoresProcessingRedesign = ({
  state,
  draftName,
  draftImage,
  onCheckAgain,
  onRequestClose,
}: {
  state: ProcessingState;
  draftName: string;
  /** The award or post the payment is for, shown with the draft */
  draftImage?: string;
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
    <Modal.Body className="flex items-center justify-center gap-4 !py-6 text-center">
      <CoreHalo />
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
          {draftImage && (
            <Row
              className="w-full rounded-16 border border-border-subtlest-tertiary p-3 text-left"
              visual={
                <Image src={draftImage} className="size-10 object-contain" />
              }
              title={draftName}
              meta="Saved, waiting for your Cores"
            />
          )}
          <Button
            onClick={onCheckAgain}
            variant={ButtonVariant.Primary}
            className="w-full"
          >
            Check again
          </Button>
          <Button
            tag="a"
            href={walletUrl}
            target="_blank"
            rel="noreferrer"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
          >
            Check the status in your wallet
          </Button>
        </>
      )}
    </Modal.Body>
  </Modal>
);
