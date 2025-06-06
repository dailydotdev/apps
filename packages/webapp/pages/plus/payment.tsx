import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { usePaymentContext } from '@dailydotdev/shared/src/contexts/payment/context';

import { useRouter } from 'next/router';
import { plusUrl } from '@dailydotdev/shared/src/lib/constants';
import { NextSeo } from 'next-seo';

import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import dynamic from 'next/dynamic';
import { useProductPricingByIds } from '@dailydotdev/shared/src/hooks/useProductPricing';
import { PlusCheckoutContainer } from '@dailydotdev/shared/src/components/plus/PlusCheckoutContainer';
import { getPlusLayout } from '../../components/layouts/PlusLayout/PlusLayout';

const PlusProductList = dynamic(
  () =>
    import(
      /* webpackChunkName: "plusProductList" */ '@dailydotdev/shared/src/components/plus/PlusProductList'
    ),
  { ssr: false },
);

const PlusPaymentPage = (): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { isPaddleReady, openCheckout } = usePaymentContext();
  const router = useRouter();
  const { pid, gift } = router.query;
  const checkoutRef = useRef();
  const { data: productPricing } = useProductPricingByIds({
    ids: [pid as string],
    loadMetadata: true,
  });

  useEffect(() => {
    if (!isPaddleReady) {
      return;
    }

    if (pid) {
      openCheckout({
        priceId: pid as string,
        giftToUserId: gift as string,
      });
    }
  }, [gift, isPaddleReady, openCheckout, pid]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    if (!pid) {
      router.replace(plusUrl);
    }
  }, [pid, router]);

  const selectedProduct = productPricing?.find(
    ({ priceId }) => priceId === pid,
  );

  return (
    <>
      <NextSeo nofollow noindex />
      <div className="m-auto flex h-full w-full flex-col gap-6 laptop:h-fit laptop:w-[34.875rem]">
        {isLaptop && selectedProduct && (
          <div className="flex flex-col items-center gap-4">
            <Typography type={TypographyType.Title2} bold>
              Plan details
            </Typography>
            <PlusProductList
              className="w-full"
              productList={[selectedProduct]}
              selected={selectedProduct.priceId}
            />
          </div>
        )}
        <div className="flex w-full flex-1 justify-center bg-background-default">
          <PlusCheckoutContainer
            ref={checkoutRef}
            className={{
              container: 'h-full w-full bg-background-default p-5 laptop:h-fit',
              element: 'h-full',
            }}
          />
        </div>
      </div>
    </>
  );
};

PlusPaymentPage.getLayout = getPlusLayout;

export default PlusPaymentPage;
