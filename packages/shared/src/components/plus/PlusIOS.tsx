import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { PlusInfo } from './PlusInfo';
import type { OpenCheckoutFn } from '../../contexts/PaymentContext';
import { usePaymentContext } from '../../contexts/PaymentContext';
import type { CommonPlusPageProps } from './common';
import { promisifyEventListener } from '../../lib/func';
import { webappUrl } from '../../lib/constants';
import { Button, ButtonVariant } from '../buttons/Button';
import { WebKitMessageHandlers } from '../../lib/ios';
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

  const queryClient = useQueryClient();

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
        <div className="flex gap-2">
          <Button
            onClick={() => {
              queryClient.refetchQueries({
                queryKey: ['iap-products'],
              });
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
    </>
  );
};
