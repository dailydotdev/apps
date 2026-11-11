import type { ReactElement } from 'react';
import React, { useEffect } from 'react';

import { useRouter } from 'next/router';
import { useViewSizeClient, ViewSize } from '@dailydotdev/shared/src/hooks';

import { webappUrl } from '@dailydotdev/shared/src/lib/constants';

import { BuyCoresContextProvider } from '@dailydotdev/shared/src/contexts/BuyCoresContext/BuyCoresContext';
import { TransactionStatusListener } from '@dailydotdev/shared/src/components/modals/award/BuyCoresModal';
import {
  getPathnameWithQuery,
  getRedirectNextPath,
} from '@dailydotdev/shared/src/lib/links';
import { getCoresLayout } from '../../components/layouts/CoresLayout';
import { CorePageMobileCheckout, seo, useCoresOriginFromQuery } from './index';

const CoresPaymentPage = (): ReactElement | null => {
  const isLaptop = useViewSizeClient(ViewSize.Laptop);
  const router = useRouter();
  const pid = router?.query?.pid;
  const eventOrigin = useCoresOriginFromQuery();

  useEffect(() => {
    if (!router?.isReady) {
      return;
    }

    if (isLaptop || !pid) {
      const searchParams = new URLSearchParams(window.location.search);
      const nextParams = new URLSearchParams();

      ['next', 'origin'].forEach((key) => {
        const value = searchParams.get(key);

        if (value) {
          nextParams.set(key, value);
        }
      });

      router?.replace(getPathnameWithQuery(`${webappUrl}cores`, nextParams));
    }
  }, [pid, router, isLaptop]);

  if (!router?.isReady) {
    return null;
  }

  if (isLaptop) {
    return null;
  }

  return (
    <BuyCoresContextProvider
      origin={eventOrigin}
      onCompletion={() => {
        router?.push(
          getRedirectNextPath(new URLSearchParams(window.location.search)),
        );
      }}
    >
      <TransactionStatusListener isOpen isDrawerOnMobile />
      <CorePageMobileCheckout />
    </BuyCoresContextProvider>
  );
};

CoresPaymentPage.getLayout = getCoresLayout;
CoresPaymentPage.layoutProps = { seo };

export default CoresPaymentPage;
