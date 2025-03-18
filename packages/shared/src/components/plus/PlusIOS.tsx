import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import type { OpenCheckoutFn } from '../../contexts/payment/context';
import { usePaymentContext } from '../../contexts/payment/context';
import type { CommonPlusPageProps } from './common';
import { promisifyEventListener } from '../../lib/func';
import { webappUrl } from '../../lib/constants';
import { iOSSupportsPlusPurchase } from '../../lib/ios';
import {
  useBoot,
  usePlusSubscription,
  useToastNotification,
} from '../../hooks';
import { DEFAULT_ERROR } from '../../graphql/common';
import Toast from '../notifications/Toast';
import { stringToBoolean } from '../../lib/utils';
import PlusListModalSection from './PlusListModalSection';
import { PlusInfo } from './PlusInfo';
import type { MarketingCtaFlags } from '../marketingCta/common';
import { MarketingCtaVariant } from '../marketingCta/common';
import { Button, ButtonVariant } from '../buttons/Button';

const PlusTrustRefund = dynamic(() =>
  import('./PlusTrustRefund').then((mod) => mod.PlusTrustRefund),
);

const PlusFAQs = dynamic(() => import('./PlusFAQ').then((mod) => mod.PlusFAQ));

export type PlusIOSProps = CommonPlusPageProps & {
  showModalSection?: boolean;
};

export const PlusIOS = ({
  shouldShowPlusHeader,
  showModalSection,
}: PlusIOSProps): ReactElement => {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const { productOptions, openCheckout, isPlusAvailable } = usePaymentContext();
  const { isPlus } = usePlusSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [listenForSuccess, setListenForSuccess] = useState(false);

  const { getMarketingCta } = useBoot();

  const { title, description, ctaText } = useMemo<
    Partial<MarketingCtaFlags>
  >(() => {
    if (!showModalSection) {
      return {};
    }
    const marketingCta = getMarketingCta(MarketingCtaVariant.Plus);
    const { flags } = marketingCta;
    return flags;
  }, [getMarketingCta, showModalSection]);

  const canContinue = useMemo(
    () =>
      iOSSupportsPlusPurchase() &&
      !!selectedOption &&
      !isPlus &&
      isPlusAvailable,
    [isPlus, isPlusAvailable, selectedOption],
  );

  const selectionChange: OpenCheckoutFn = useCallback(({ priceId }) => {
    setSelectedOption(priceId);
  }, []);

  const onContinue = useCallback(() => {
    setListenForSuccess(true);
    openCheckout({ priceId: selectedOption });
  }, [openCheckout, selectedOption]);

  useEffect(() => {
    promisifyEventListener('iap-error', ({ detail }) => {
      if (detail === 'userCancelled') {
        setListenForSuccess(false);
        return;
      }

      displayToast(DEFAULT_ERROR);
    });

    promisifyEventListener<void, 'true' | 'false'>(
      'iap-loading',
      ({ detail }) => {
        setIsLoading(stringToBoolean(detail));
      },
      {
        once: false,
      },
    ).catch(() => {
      setIsLoading(false);
    });

    return () => {
      globalThis?.eventControllers?.['iap-error']?.abort();
      globalThis?.eventControllers?.['iap-loading']?.abort();
    };
  }, [displayToast, isPlusAvailable, router, selectedOption]);

  useEffect(() => {
    if (!listenForSuccess) {
      return () => {};
    }

    promisifyEventListener('iap-purchase-result', (event) => {
      const result = event.detail;
      if (result !== 'success') {
        return;
      }

      router.replace(`${webappUrl}plus/success`);
    });

    return () => {
      globalThis?.eventControllers?.['iap-purchase-result']?.abort();
    };
  }, [listenForSuccess, router]);

  return (
    <div className="flex flex-1">
      {!showModalSection && <Toast autoDismissNotifications />}

      <div
        className="flex flex-1 flex-col p-6"
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
          <div
            className={classNames(
              'flex flex-wrap items-center rounded-12 border border-border-subtlest-tertiary px-3 py-2 text-text-tertiary typo-callout tablet:mt-1',
              (shouldShowPlusHeader || showModalSection) && 'mb-6',
            )}
          >
            Plus subscriptions aren&apos;t supported in this version of the app.
            🚀 Upgrade to the latest version to purchase and supercharge your
            experience!
          </div>
        )}

        <PlusInfo
          productOptions={productOptions || []}
          selectedOption={selectedOption}
          onChange={selectionChange}
          onContinue={!showModalSection && onContinue}
          shouldShowPlusHeader={shouldShowPlusHeader || showModalSection}
          showDailyDevLogo={showModalSection}
          continueEnabled={canContinue}
          isContinueLoading={isLoading}
          showGiftButton={false}
          showPlusList={showModalSection && false}
          showTrustReviews={showModalSection && false}
          title={title}
          description={description}
        />
        {showModalSection ? (
          <>
            <Button
              onClick={onContinue}
              variant={ButtonVariant.Primary}
              className="mt-8"
            >
              {ctaText}
            </Button>
          </>
        ) : (
          <>
            <PlusTrustRefund className="mt-6" />
            <PlusFAQs />
          </>
        )}
      </div>
      {showModalSection && <PlusListModalSection />}
    </div>
  );
};
