import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import type { FunnelStepCheckout } from '../types/funnel';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePlusSubscription } from '../../../hooks';
import { selectedPlanAtom, applyDiscountAtom } from '../store/funnelStore';
import { LogEvent } from '../../../lib/log';
import { usePaymentContext } from '../../../contexts/payment/context';

export const InnerFunnelCheckout = ({
  parameters: { discountCode },
  isActive,
}: FunnelStepCheckout): ReactElement => {
  const { user, geo, isValidRegion: isPlusAvailable } = useAuthContext();
  const { paddle, openCheckout } = usePaymentContext();
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const priceId = useAtomValue(selectedPlanAtom);
  const applyDiscount = useAtomValue(applyDiscountAtom);

  useEffect(() => {
    if (isActive) {
      logSubscriptionEvent({
        event_name: LogEvent.InitiateCheckout,
      });
    }
  }, [isActive, logSubscriptionEvent]);

  useEffect(() => {
    if (!isPlusAvailable || isPlus || !paddle) {
      return;
    }

    openCheckout({
      priceId,
      discountId: applyDiscount ? discountCode : undefined,
    });
  }, [
    discountCode,
    applyDiscount,
    geo?.region,
    isPlus,
    isPlusAvailable,
    paddle,
    priceId,
    user?.email,
    user?.id,
    openCheckout,
  ]);

  return <div className="checkout-container" />;
};

export const FunnelCheckout = (props: FunnelStepCheckout): ReactElement => {
  const { isLoggedIn } = useAuthContext();

  if (!isLoggedIn) {
    return null;
  }

  return <InnerFunnelCheckout {...props} />;
};
