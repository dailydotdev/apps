import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { CoreFAQ } from '@dailydotdev/shared/src/components/cores/CoreFAQ';
import { CoreOptions } from '@dailydotdev/shared/src/components/modals/award/BuyCoresModal';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { BuyCoresContextProvider } from '@dailydotdev/shared/src/contexts/BuyCoresContext/BuyCoresContext';
import { useBuyCoresContext } from '@dailydotdev/shared/src/contexts/BuyCoresContext/types';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { coresPricesQueryOptions } from '@dailydotdev/shared/src/graphql/njord';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
import { useRoute } from '../../real/providers';
import { friendshipArt, SquadFrame } from './frame';

// /cores in the wallet's squads hub frame: production's page as is ("Get More
// Cores", the balance and the pack list from CoreOptions, then the FAQ) in the
// main card, and the character art in place of the hands video in the side
// column, which also holds the checkout once a pack is picked.

const usePrices = () => {
  const { user, isLoggedIn } = useAuthContext();
  return useQuery(coresPricesQueryOptions({ user, isLoggedIn })).data;
};

/** Opens the page on a pack, as a pid from the wallet does */
const InitialPack = ({ cores }: { cores: number }): null => {
  const prices = usePrices();
  const { setSelectedProduct } = useBuyCoresContext();

  useEffect(() => {
    const price = prices?.find(({ metadata }) => metadata.coresValue === cores);
    if (price) {
      setSelectedProduct({ id: price.priceId, value: cores });
    }
  }, [prices, cores, setSelectedProduct]);

  return null;
};

const Checkout = ({
  onPay,
}: {
  onPay?: (cores: number) => void;
}): ReactElement => {
  const prices = usePrices();
  const { selectedProduct } = useBuyCoresContext();
  const selectedPrice = prices?.find(
    ({ priceId }) => priceId === selectedProduct?.id,
  );

  return (
    <section
      aria-label="Checkout"
      className="flex w-full flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary"
    >
      <img
        src={friendshipArt}
        alt="Friends sharing a Core with Patchy"
        className="aspect-square w-full object-cover"
      />
      {selectedProduct && selectedPrice && (
        <div className="flex flex-col gap-3 p-4">
          <span className="flex items-center gap-2">
            <CoreIcon size={IconSize.Large} />
            <span className="flex flex-col">
              <strong className="tabular-nums typo-title3">
                {formatCoresCurrency(selectedProduct.value)} Cores
              </strong>
              <span className="text-text-tertiary typo-footnote">
                {selectedPrice.price.formatted}
              </span>
            </span>
          </span>
          <Button
            variant={ButtonVariant.Primary}
            onClick={() => onPay?.(selectedProduct.value)}
          >
            Pay for {formatCoresCurrency(selectedProduct.value)} Cores
          </Button>
          <span className="text-center text-text-quaternary typo-caption2">
            Storybook: Paddle&apos;s checkout opens here in production
          </span>
        </div>
      )}
    </section>
  );
};

export const CoresPage = ({
  initialPack,
  onPay,
}: {
  /** Cores value of the pack the page opens with (a pid from the wallet) */
  initialPack?: number;
  /** Storybook stand-in for the Paddle checkout */
  onPay?: (cores: number) => void;
}): ReactElement => {
  useRoute('/cores');

  return (
    <BuyCoresContextProvider origin={Origin.WalletPageCTA}>
      {!!initialPack && <InitialPack cores={initialPack} />}
      <div className="flex flex-col">
        <SquadFrame widgets={<Checkout onPay={onPay} />}>
          <CoreOptions
            className="p-6"
            title={
              <Typography
                className="mb-4"
                type={TypographyType.LargeTitle}
                bold
              >
                Get More Cores
              </Typography>
            }
            showCoresAtCheckout
          />
        </SquadFrame>
        <CoreFAQ />
      </div>
    </BuyCoresContextProvider>
  );
};
