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
import {
  useProductPricing,
  useProductPricingByIds,
} from '@dailydotdev/shared/src/hooks/useProductPricing';
import { PurchaseType } from '@dailydotdev/shared/src/graphql/paddle';
import { PlusCheckoutContainer } from '@dailydotdev/shared/src/components/plus/PlusCheckoutContainer';
import { usePlusSale } from '@dailydotdev/shared/src/hooks/usePlusSale';
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
  const { isPaddleReady, openCheckout, productOptions } = usePaymentContext();
  const { discountId } = usePlusSale();
  const router = useRouter();
  const { pid, gift } = router.query;
  const checkoutRef = useRef<HTMLDivElement>(null);
  const { data: productPricing } = useProductPricingByIds({
    ids: [pid as string],
    loadMetadata: true,
  });
  // Gifting buys a one-off product the subscription sale doesn't cover.
  const isDiscounted = !!discountId && !gift;
  const isPersonalPlan = productOptions?.some(({ priceId }) => priceId === pid);
  // The provider previews personal plans, so a team purchase needs its own
  // discounted preview: pricingPreviewByIds takes no discount, and quoting its
  // list price next to a discounted Paddle total is what misleads the buyer.
  const { data: teamPricing } = useProductPricing({
    type: PurchaseType.Organization,
    discountId,
    enabled: isDiscounted && !isPersonalPlan,
  });

  useEffect(() => {
    if (!isPaddleReady) {
      return;
    }

    if (pid) {
      openCheckout?.({
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

  const pricing = isDiscounted
    ? [...(productOptions ?? []), ...(teamPricing ?? [])]
    : productPricing;
  const selectedProduct = pricing?.find(({ priceId }) => priceId === pid);

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
            checkoutRef={checkoutRef}
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
