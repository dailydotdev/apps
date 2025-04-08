import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import type { CheckoutUpdateOptions, PaddleEventData } from '@paddle/paddle-js';
import { CheckoutEventNames } from '@paddle/paddle-js';
import type { FunnelStepCheckout } from '../types/funnel';
import { usePaddle } from '../../payment/hooks/usePaddle';
import { FunnelStepTransitionType } from '../types/funnel';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePlusSubscription } from '../../../hooks';

export const FunnelCheckout = ({
  priceId,
  discountCode,
  onTransition,
}: FunnelStepCheckout): ReactElement => {
  const isCheckoutOpenedRef = useRef(false);
  const { user, geo, isValidRegion: isPlusAvailable } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { paddle } = usePaddle({
    paddleCallback: (event: PaddleEventData) => {
      switch (event?.name) {
        case CheckoutEventNames.CHECKOUT_COMPLETED:
          onTransition({
            type: FunnelStepTransitionType.Complete,
          });
          break;
        default:
          break;
      }
    },
  });

  useEffect(() => {
    if (!isPlusAvailable || isPlus || !paddle) {
      return;
    }

    const props: CheckoutUpdateOptions = {
      items: [{ priceId, quantity: 1 }],
      discountCode,
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
      });
    }
  }, [
    discountCode,
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
