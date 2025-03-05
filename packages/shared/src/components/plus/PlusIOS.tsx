import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { PlusInfo } from './PlusInfo';
import type { OpenCheckoutFn } from '../../contexts/PaymentContext';
import type { CommonPlusPageProps } from './common';
import { isNullOrUndefined, promisifyEventListener } from '../../lib/func';
import type { PlusPriceType } from '../../lib/featureValues';
import { PlusPriceTypeAppsId } from '../../lib/featureValues';
import { useFeature } from '../GrowthBookProvider';
import { featureIAPProducts } from '../../lib/featureManagement';
import { webappUrl } from '../../lib/constants';
import { useAuthContext } from '../../contexts/AuthContext';
import { Button, ButtonVariant } from '../buttons/Button';
import { sendMessage, WebKitMessageHandlers } from '../../lib/ios';

const PlusTrustRefund = dynamic(() =>
  import('./PlusTrustRefund').then((mod) => mod.PlusTrustRefund),
);

const PlusFAQs = dynamic(() => import('./PlusFAQ').then((mod) => mod.PlusFAQ));

type IAPProduct = {
  attributes: {
    description: {
      standard: string;
    };
    icuLocale: string;
    isFamilyShareable: number;
    kind: string;
    name: string;
    offerName: string;
    offers: {
      currencyCode: string;
      discounts: unknown[]; // Specify a more detailed type if known
      price: string;
      priceFormatted: string;
      recurringSubscriptionPeriod: string;
    }[];
    subscriptionFamilyId: string;
    subscriptionFamilyName: string;
    subscriptionFamilyRank: number;
  };
  href: string;
  id: string;
  type: string;
};

export const PlusIOS = ({
  shouldShowPlusHeader,
}: CommonPlusPageProps): ReactElement => {
  const router = useRouter();
  const { user } = useAuthContext();
  const productIds = useFeature(featureIAPProducts);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const selectionChange: OpenCheckoutFn = useCallback(({ priceId }) => {
    setSelectedOption(priceId);
  }, []);

  const onContinue = useCallback(() => {
    sendMessage(WebKitMessageHandlers.IAPSubscriptionRequest, {
      productId: selectedOption,
      appAccountToken: user?.subscriptionFlags?.appAccountToken,
    });
  }, [selectedOption, user?.subscriptionFlags?.appAccountToken]);

  const productList = useMemo(() => Object.keys(productIds), [productIds]);

  const { data: productOptions, ...query } = useQuery({
    queryKey: ['iap-products'],
    queryFn: async () => {
      const products = promisifyEventListener(
        'iap-products-result',
        (event) => {
          const productsRaw = !isNullOrUndefined(event?.detail)
            ? JSON.parse(event.detail)
            : [];

          return productsRaw
            ?.map((product: IAPProduct) => {
              const duration = productIds[
                product.attributes.offerName
              ] as PlusPriceType;
              const currencySymbol =
                product.attributes.offers[0].priceFormatted.replace(
                  /\d|\.|\s|,/g,
                  '',
                );

              return {
                label: product.attributes.name,
                value: product.attributes.offerName,
                price: {
                  amount: product.attributes.offers[0].price,
                  formatted: product.attributes.offers[0].priceFormatted,
                  monthlyAmount: product.attributes.offers[0].price,
                  monthlyFormatted: product.attributes.offers[0].priceFormatted,
                },
                currencyCode: product.attributes.offers[0].currencyCode,
                currencySymbol,
                extraLabel: product.attributes?.description?.standard,
                appsId: PlusPriceTypeAppsId.Default,
                duration,
              };
            })
            .sort((a: { value: string }, b: { value: string }) => {
              // Make sure that the products are sorted in the same order as the product list
              // because the native code does not guarantee the order of the products
              const aIndex = productList.indexOf(a.value);
              const bIndex = productList.indexOf(b.value);
              return aIndex - bIndex;
            });
        },
      );

      sendMessage(WebKitMessageHandlers.IAPProductList, productList);

      return products;
    },
  });

  useEffect(() => {
    promisifyEventListener('iap-purchase-result', (event) => {
      const result = event.detail;
      if (result !== 'success') {
        return;
      }

      router.replace(`${webappUrl}plus/success`);
    });
  }, [router, selectedOption]);

  return (
    <div
      className="flex flex-col p-6"
      ref={(element) => {
        if (!element) {
          return;
        }

        if (productOptions?.[0]?.value && !selectedOption) {
          setSelectedOption(productOptions?.[0]?.value);
        }
      }}
    >
      <div className="flex gap-2">
        <Button
          onClick={() => {
            query.refetch();
          }}
          variant={ButtonVariant.Float}
        >
          Reload
        </Button>
        <Button
          onClick={() => {
            globalThis.webkit.messageHandlers[
              WebKitMessageHandlers.IAPSubscriptionManage
            ].postMessage(null);
          }}
          variant={ButtonVariant.Float}
        >
          Manage
        </Button>
      </div>
      <PlusInfo
        productOptions={productOptions || []}
        selectedOption={selectedOption}
        onChange={selectionChange}
        onContinue={onContinue}
        shouldShowPlusHeader={shouldShowPlusHeader}
        showGiftButton={false}
      />
      <PlusTrustRefund className="mt-6" />
      <PlusFAQs />
    </div>
  );
};
