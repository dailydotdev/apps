import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { PlusInfo } from './PlusInfo';
import type { OpenCheckoutFn } from '../../contexts/payment/context';
import { usePaymentContext } from '../../contexts/payment/context';
import type { CommonPlusPageProps } from './common';
import { promisifyEventListener } from '../../lib/func';
import { webappUrl } from '../../lib/constants';
import { iOSSupportsPlusPurchase } from '../../lib/ios';
import { useToastNotification } from '../../hooks';
import { DEFAULT_ERROR } from '../../graphql/common';
import Toast from '../notifications/Toast';

const PlusTrustRefund = dynamic(() =>
  import('./PlusTrustRefund').then((mod) => mod.PlusTrustRefund),
);

const PlusFAQs = dynamic(() => import('./PlusFAQ').then((mod) => mod.PlusFAQ));

export const PlusIOS = ({
  shouldShowPlusHeader,
}: CommonPlusPageProps): ReactElement => {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const { productOptions, openCheckout } = usePaymentContext();

  const selectionChange: OpenCheckoutFn = useCallback(({ priceId }) => {
    setSelectedOption(priceId);
  }, []);

  const onContinue = useCallback(() => {
    openCheckout({ priceId: selectedOption });
  }, [openCheckout, selectedOption]);

  useEffect(() => {
    promisifyEventListener('iap-purchase-result', (event) => {
      const result = event.detail;
      if (result !== 'success') {
        return;
      }

      router.replace(`${webappUrl}plus/success`);
    });

    promisifyEventListener('iap-error', () => {
      displayToast(DEFAULT_ERROR);
    });

    return () => {
      globalThis?.eventControllers?.['iap-purchase-result']?.abort();
      globalThis?.eventControllers?.['iap-error']?.abort();
    };
  }, [displayToast, router, selectedOption]);

  return (
    <>
      <Toast autoDismissNotifications />
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
        {!iOSSupportsPlusPurchase() && (
          <div className="flex flex-wrap items-center rounded-12 border border-border-subtlest-tertiary px-3 py-2 text-text-tertiary typo-callout tablet:mt-1">
            Purchasing Plus subscriptions is not supported in this version of
            the app. Please update to the latest version to purchase Plus
            subscriptions.
          </div>
        )}

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
    </>
  );
};
