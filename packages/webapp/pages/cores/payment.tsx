import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';

import { useRouter } from 'next/router';
import { useViewSizeClient, ViewSize } from '@dailydotdev/shared/src/hooks';

import { webappUrl } from '@dailydotdev/shared/src/lib/constants';

import { BuyCoresContextProvider } from '@dailydotdev/shared/src/contexts/BuyCoresContext';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { TransactionStatusListener } from '@dailydotdev/shared/src/components/modals/award/BuyCoresModal';
import { getTemplatedTitle } from '../../components/layouts/utils';
import { defaultOpenGraph } from '../../next-seo';
import { getCoresLayout } from '../../components/layouts/CoresLayout';
import { CorePageMobileCheckout } from './index';

const seo: NextSeoProps = {
  title: getTemplatedTitle('TODO: Buy cores title'),
  openGraph: { ...defaultOpenGraph },
  description: 'TODO: Buy cores description',
};

const CoresPaymentPage = (): ReactElement => {
  const isLaptop = useViewSizeClient(ViewSize.Laptop);
  const router = useRouter();
  const pid = router?.query?.pid;

  useEffect(() => {
    if (!router?.isReady) {
      return;
    }

    if (isLaptop || !pid) {
      router?.replace(`${webappUrl}cores`);
    }
  }, [pid, router, isLaptop]);

  if (!router?.isReady) {
    return null;
  }

  if (isLaptop) {
    return null;
  }

  return (
    // TODO: Take correct origin from referrer
    <BuyCoresContextProvider
      origin={Origin.EarningsPageCTA}
      onCompletion={() => {
        router?.push(webappUrl);
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
