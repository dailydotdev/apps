import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import {
  BuyCoresContextProvider,
  useBuyCoresContext,
} from '@dailydotdev/shared/src/contexts/BuyCoresContext';
import { useRouter } from 'next/router';
import { useViewSizeClient, ViewSize } from '@dailydotdev/shared/src/hooks';

import { CoreFAQ } from '@dailydotdev/shared/src/components/cores/CoreFAQ';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import {
  BuyCoresCheckout,
  CoreOptions,
  CorePageCheckoutVideo,
  TransactionStatusListener,
} from '@dailydotdev/shared/src/components/modals/award/BuyCoresModal';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';

import classNames from 'classnames';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import classed from '@dailydotdev/shared/src/lib/classed';
import { useQuery } from '@tanstack/react-query';
import { transactionPricesQueryOptions } from '@dailydotdev/shared/src/graphql/njord';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';

import { getCoresLayout } from '../../components/layouts/CoresLayout';
import { defaultOpenGraph } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  title: getTemplatedTitle('TODO: Buy cores title'),
  openGraph: { ...defaultOpenGraph },
  description: 'TODO: Buy cores description',
};

const MobileContainer = classed(
  'div',
  'flex flex-1 flex-col bg-gradient-to-t from-theme-overlay-float-bun to-transparen',
);

export const CorePageMobileCheckout = (): ReactElement => {
  const { isLoggedIn, user } = useAuthContext();
  const { openCheckout, selectedProduct, setSelectedProduct } =
    useBuyCoresContext();
  const router = useRouter();
  const pid = router?.query?.pid;

  const { data: prices } = useQuery(
    transactionPricesQueryOptions({
      user,
      isLoggedIn,
    }),
  );

  useEffect(() => {
    if (!prices) {
      return;
    }

    if (!pid) {
      return;
    }

    const selectedPrice = prices.find((price) => price.value === pid);

    if (selectedPrice) {
      setSelectedProduct({
        id: selectedPrice.value,
        value: selectedPrice.coresValue,
      });

      openCheckout({
        priceId: selectedPrice.value,
      });
    }
  }, [prices, setSelectedProduct, openCheckout, pid]);

  useEffect(() => {
    if (selectedProduct) {
      openCheckout({ priceId: selectedProduct.id });
    }
  }, [openCheckout, selectedProduct]);

  return (
    <MobileContainer>
      <BuyCoresCheckout
        className={classNames(
          'rounded-16 border border-border-subtlest-tertiary p-6',
        )}
      />
    </MobileContainer>
  );
};

export const PageCoreOptions = (): ReactElement => {
  return (
    <CoreOptions
      className="p-6"
      title={
        <Typography className="mb-4" type={TypographyType.LargeTitle} bold>
          Get More Cores
        </Typography>
      }
      showCoresAtCheckout
    />
  );
};

const CorePageMobile = (): ReactElement => {
  const { selectedProduct } = useBuyCoresContext();
  const router = useRouter();

  useEffect(() => {
    if (selectedProduct) {
      router?.push(`${webappUrl}cores/payment?pid=${selectedProduct?.id}`);
    }
  }, [router, selectedProduct]);

  return (
    <MobileContainer>
      <PageCoreOptions />
    </MobileContainer>
  );
};

const CorePageDesktop = (): ReactElement => {
  const { selectedProduct } = useBuyCoresContext();

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-gradient-to-t from-theme-overlay-float-bun to-transparent pt-10">
        <div className="mx-a mx-4 flex w-full max-w-[63.75rem] flex-1 gap-4">
          <PageCoreOptions />
          <BuyCoresCheckout
            className={classNames(
              !selectedProduct && 'hidden',
              'rounded-br-16 p-6',
            )}
          />
          <div
            className={classNames(
              'flex flex-1 overflow-hidden rounded-16',
              selectedProduct && 'hidden',
            )}
          >
            {!selectedProduct && <CorePageCheckoutVideo />}
          </div>
        </div>
        <CoreFAQ />
      </div>
    </>
  );
};

const CoresPage = (): ReactElement => {
  const router = useRouter();
  const isLaptop = useViewSizeClient(ViewSize.Laptop);
  const amountNeeded = +router?.query?.need;

  if (!router?.isReady) {
    return null;
  }

  return (
    // TODO: Take correct origin from referrer
    <BuyCoresContextProvider
      origin={Origin.EarningsPageCTA}
      onCompletion={() => {
        router?.push(webappUrl);
      }}
      amountNeeded={amountNeeded || undefined}
    >
      <TransactionStatusListener isOpen isDrawerOnMobile />
      {isLaptop ? <CorePageDesktop /> : <CorePageMobile />}
    </BuyCoresContextProvider>
  );
};

CoresPage.getLayout = getCoresLayout;
CoresPage.layoutProps = { seo };

export default CoresPage;
