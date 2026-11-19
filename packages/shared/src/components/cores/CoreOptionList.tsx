import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CoreOptionButton,
  CoreOptionButtonPlaceholder,
} from './CoreOptionButton';
import { isIOSNative, promisifyEventListener } from '../../lib/func';
import { stringToBoolean } from '../../lib/utils';
import { useBuyCoresContext } from '../../contexts/BuyCoresContext/types';
import { coresPricesQueryOptions } from '../../graphql/njord';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useViewSize, ViewSize } from '../../hooks';
import { LogEvent } from '../../lib/log';
import { getRecommendedCorePrice } from './recommendedCorePrice';

export const CoreOptionList = (): ReactElement => {
  const { user, isLoggedIn } = useAuthContext();
  const { logEvent } = useLogContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const {
    selectedProduct,
    setSelectedProduct,
    openCheckout,
    paddle,
    origin,
    minCoresToBuy,
  } = useBuyCoresContext();
  const [isLoadingNative, setLoadingNative] = useState(false);
  const { data: prices, isPending: isPendingPrices } = useQuery(
    coresPricesQueryOptions({
      user,
      isLoggedIn,
    }),
  );
  const recommended = getRecommendedCorePrice({
    prices,
    minCores: minCoresToBuy,
  });
  const preselectedRef = useRef(false);

  // On desktop the checkout sits next to the list, so open it on the pack
  // that covers what the user needs. The user can still pick another pack.
  // Mobile and iOS open the checkout full screen (or the native sheet), so
  // there we only highlight the pack.
  useEffect(() => {
    if (
      preselectedRef.current ||
      !recommended ||
      selectedProduct ||
      isMobile ||
      isIOSNative() ||
      !paddle ||
      !openCheckout
    ) {
      return;
    }

    preselectedRef.current = true;
    const cores = recommended.metadata.coresValue ?? 0;

    logEvent({
      event_name: LogEvent.SelectCreditsQuantity,
      extra: JSON.stringify({ origin, quantity: cores, preselected: true }),
    });
    setSelectedProduct({ id: recommended.priceId, value: cores });
    openCheckout({ priceId: recommended.priceId });
  }, [
    recommended,
    selectedProduct,
    isMobile,
    paddle,
    openCheckout,
    logEvent,
    origin,
    setSelectedProduct,
  ]);

  useEffect(() => {
    promisifyEventListener<void, 'true' | 'false'>(
      'iap-loading',
      ({ detail }) => {
        setLoadingNative(stringToBoolean(detail));
      },
      {
        once: false,
      },
    ).catch(() => {
      setLoadingNative(false);
    });

    return () => {
      (
        globalThis as {
          eventControllers?: Record<string, AbortController | null>;
        }
      )?.eventControllers?.['iap-loading']?.abort();
    };
  }, []);

  return (
    <ul className="mt-4 flex flex-col gap-2" role="radiogroup">
      {isPendingPrices &&
        new Array(9).fill(null).map((_, index) => {
          // eslint-disable-next-line react/no-array-index-key
          return <CoreOptionButtonPlaceholder key={index} />;
        })}
      {!isPendingPrices &&
        prices?.map((price) => {
          return (
            <CoreOptionButton
              key={price.priceId}
              id={price.priceId}
              label={price.metadata.title}
              cores={price.metadata.coresValue ?? 0}
              priceFormatted={price.price.formatted}
              isRecommended={price.priceId === recommended?.priceId}
              isNotEnough={
                !!minCoresToBuy &&
                (price.metadata.coresValue ?? 0) < minCoresToBuy
              }
              isLoading={
                isLoadingNative && price.priceId === selectedProduct?.id
              }
              // prevent clicks while native iap is loading
              isDisabled={isLoadingNative}
            />
          );
        })}
    </ul>
  );
};
