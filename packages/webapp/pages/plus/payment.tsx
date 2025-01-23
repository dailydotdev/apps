import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { usePaymentContext } from '@dailydotdev/shared/src/contexts/PaymentContext';

import { useRouter } from 'next/router';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { NextSeo } from 'next-seo';
import { PlusUnavailable } from '@dailydotdev/shared/src/components/plus/PlusUnavailable';

import { getPlusLayout } from '../../components/layouts/PlusLayout/PlusLayout';

const PlusPaymentPage = (): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { openCheckout, isPlusAvailable } = usePaymentContext();
  const router = useRouter();
  const { pid } = router.query;

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    if (!pid || isLaptop) {
      router.replace(`${webappUrl}plus`);
    }
  }, [isLaptop, pid, router]);

  return (
    <>
      <NextSeo nofollow noindex />
      <div className="flex flex-1 justify-center bg-background-default">
        <div
          ref={(element) => {
            if (!element) {
              return;
            }

            openCheckout({ priceId: pid as string });
          }}
          className="checkout-container h-full w-full bg-background-default p-5"
        >
          {!isPlusAvailable && <PlusUnavailable className="h-full" />}
        </div>
      </div>
    </>
  );
};

PlusPaymentPage.getLayout = getPlusLayout;

export default PlusPaymentPage;
