import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import type { FunnelStepCheckout } from '../types/funnel';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePlusSubscription } from '../../../hooks';
import { selectedPlanAtom, applyDiscountAtom } from '../store/funnelStore';
import { LogEvent } from '../../../lib/log';
import { usePaymentContext } from '../../../contexts/payment/context';

export const FunnelCheckout = ({
  parameters: { discountCode },
  isActive,
}: FunnelStepCheckout): ReactElement => {
  const { isValidRegion: isPlusAvailable } = useAuthContext();
  const { openCheckout, isPaddleReady } = usePaymentContext();
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const priceId = useAtomValue(selectedPlanAtom);
  const applyDiscount = useAtomValue(applyDiscountAtom);
  const currentPriceIdRef = useRef<string | null>(null);
  const shouldUpdate =
    isPlusAvailable &&
    !isPlus &&
    isPaddleReady &&
    priceId &&
    priceId !== currentPriceIdRef.current;

  useEffect(() => {
    if (isActive) {
      logSubscriptionEvent({
        event_name: LogEvent.InitiateCheckout,
      });
    }
  }, [isActive, logSubscriptionEvent]);

  useEffect(() => {
    if (!shouldUpdate) {
      return;
    }

    currentPriceIdRef.current = priceId;
    console.log('rendering checkout with priceId:', priceId);

    openCheckout({
      priceId,
      discountId: applyDiscount ? discountCode : undefined,
    });
  }, [discountCode, applyDiscount, shouldUpdate, priceId, openCheckout]);

  return <div className="checkout-container" />;
};
