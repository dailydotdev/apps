import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import type {
  CheckoutUpdateOptions,
  PaddleEventData,
  CheckoutOpenOptions,
} from '@paddle/paddle-js';
import { CheckoutEventNames } from '@paddle/paddle-js';
import { useAtomValue } from 'jotai';
import type { FunnelStepCheckout } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePlusSubscription } from '../../../hooks';
import {
  paddleInstanceAtom,
  selectedPlanAtom,
  applyDiscountAtom,
} from '../store/funnelStore';
import { usePaddleEvent } from '../hooks/usePaddleEvent';
import { LogEvent } from '../../../lib/log';

export const InnerFunnelCheckout = ({
  parameters: { discountCode },
  onTransition,
  isActive,
}: FunnelStepCheckout): ReactElement => {
  const isCheckoutOpenedRef = useRef(false);
  const { user, geo, isValidRegion: isPlusAvailable } = useAuthContext();
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const paddle = useAtomValue(paddleInstanceAtom);
  const priceId = useAtomValue(selectedPlanAtom);
  const applyDiscount = useAtomValue(applyDiscountAtom);

  useEffect(() => {
    if (isActive) {
      logSubscriptionEvent({
        event_name: LogEvent.InitiateCheckout,
      });
    }
  }, [isActive, logSubscriptionEvent]);

  usePaddleEvent((event: PaddleEventData) => {
    switch (event?.name) {
      case CheckoutEventNames.CHECKOUT_COMPLETED:
        onTransition({
          type: FunnelStepTransitionType.Complete,
        });
        break;
      default:
        break;
    }
  });

  useEffect(() => {
    if (!isPlusAvailable || isPlus || !paddle) {
      return;
    }

    const props: CheckoutUpdateOptions = {
      items: [{ priceId, quantity: 1 }],
      discountId: applyDiscount ? discountCode : undefined,
      customer: {
        email: user?.email,
        ...(geo?.region && {
          address: {
            countryCode: geo?.region,
          },
        }),
      },
    };

    if (isCheckoutOpenedRef.current) {
      paddle.Checkout.updateCheckout(props);
    } else {
      paddle.Checkout.open({
        ...props,
        settings: {
          displayMode: 'inline',
          variant: 'one-page',
          frameTarget: 'checkout-container',
          frameInitialHeight: 500,
          frameStyle:
            'width: 100%; background-color: transparent; border: none;',
          theme: 'dark',
        },
        customData: {
          user_id: user?.id,
        },
      } as CheckoutOpenOptions);
    }
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
