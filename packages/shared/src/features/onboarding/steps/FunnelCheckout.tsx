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
  const { isValidRegion: isPlusAvailable } = useAuthContext();
  const { paddle, openCheckout, isCheckoutOpen } = usePaymentContext();
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

  const shouldSkip = !isPlusAvailable || isPlus || !paddle || isCheckoutOpen;

  return (
    <div
      className="checkout-container"
      ref={(el) => {
        if (shouldSkip || !el) {
          return;
        }

        openCheckout({
          priceId,
          discountId: applyDiscount ? discountCode : undefined,
        });
      }}
    />
  );
};

export const FunnelCheckout = (props: FunnelStepCheckout): ReactElement => {
  const { isLoggedIn } = useAuthContext();

  if (!isLoggedIn) {
    return null;
  }

  return <InnerFunnelCheckout {...props} />;
};
