import type { ReactElement, ReactNode } from 'react';
import React, { useEffect } from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import {
  BuyCoresContextProvider,
  useBuyCoresContext,
  useCoreProductOptionQuery,
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

import {
  getPathnameWithQuery,
  getRedirectNextPath,
} from '@dailydotdev/shared/src/lib/links';
import { getCoresLayout } from '../../components/layouts/CoresLayout';
import { defaultOpenGraph } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

export const seo: NextSeoProps = {
  title: getTemplatedTitle('Buy Cores'),
  openGraph: { ...defaultOpenGraph },
  description:
    'Purchase Cores to recognize valuable contributions, support creators, and fuel the developer community on daily.dev. Fast, secure, and flexible credit bundles.',
};

const MobileContainer = classed(
  'div',
  'flex flex-1 flex-col bg-gradient-to-t from-theme-overlay-float-bun to-transparen',
);

export const CorePageMobileCheckout = (): ReactElement => {
  const { openCheckout, selectedProduct, paddle, setSelectedProduct } =
    useBuyCoresContext();

  const productFromQuery = useCoreProductOptionQuery();

  useEffect(() => {
    setSelectedProduct(productFromQuery);
  }, [productFromQuery, setSelectedProduct]);

  useEffect(() => {
    if (!paddle) {
      return;
    }

    if (!selectedProduct) {
      return;
    }

    openCheckout({ priceId: selectedProduct.id });
  }, [openCheckout, selectedProduct, productFromQuery, paddle]);

  return (
    <MobileContainer>
      <BuyCoresCheckout className="p-6" />
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
      const searchParams = new URLSearchParams(window.location.search);
      const nextParams = new URLSearchParams();

      if (searchParams.get('next')) {
        nextParams.set('next', searchParams.get('next'));
      }

      nextParams.append('pid', selectedProduct.id);

      router?.push(
        getPathnameWithQuery(`${webappUrl}cores/payment`, nextParams),
      );
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
              'rounded-16 border border-border-subtlest-tertiary p-6',
            )}
          />
          <div
            className={classNames(
              'm-6 flex flex-1 overflow-hidden rounded-16',
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

const CorePageRenderer = ({ children }: { children: ReactNode }): ReactNode => {
  const isLaptop = useViewSizeClient(ViewSize.Laptop);
  const { setSelectedProduct, openCheckout, paddle } = useBuyCoresContext();
  const router = useRouter();

  const productFromQuery = useCoreProductOptionQuery();

  useEffect(() => {
    if (!paddle) {
      return;
    }

    if (!productFromQuery) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    params.delete('pid');
    router?.replace(getPathnameWithQuery(router?.pathname, params));

    if (isLaptop) {
      setSelectedProduct(productFromQuery);

      openCheckout({ priceId: productFromQuery.id });
    }
  }, [
    isLaptop,
    openCheckout,
    productFromQuery,
    router,
    setSelectedProduct,
    paddle,
  ]);

  return children;
};

const CoresPage = (): ReactElement => {
  const router = useRouter();
  const isLaptop = useViewSizeClient(ViewSize.Laptop);
  const amountNeeded = +router?.query?.need;

  return (
    // TODO: Take correct origin from referrer
    <BuyCoresContextProvider
      origin={Origin.WalletPageCTA}
      onCompletion={() => {
        router?.push(
          getRedirectNextPath(new URLSearchParams(window.location.search)),
        );
      }}
      amountNeeded={amountNeeded || undefined}
    >
      <TransactionStatusListener isOpen isDrawerOnMobile />
      <CorePageRenderer>
        {isLaptop ? <CorePageDesktop /> : <CorePageMobile />}
      </CorePageRenderer>
    </BuyCoresContextProvider>
  );
};

CoresPage.getLayout = getCoresLayout;
CoresPage.layoutProps = { seo };

export default CoresPage;
