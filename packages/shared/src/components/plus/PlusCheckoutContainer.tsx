import type { ReactElement } from 'react';
import React from 'react';

import classNames from 'classnames';
import { usePaymentContext } from '../../contexts/PaymentContext';
import { usePlusSubscription } from '../../hooks';
import { PlusUnavailable } from './PlusUnavailable';
import { PlusPlus } from './PlusPlus';
import { useGiftUserContext } from './GiftUserContext';

export type PlusCheckoutContainerProps = {
  checkoutRef?: React.LegacyRef<HTMLDivElement>;
  className?: {
    container?: string;
    element?: string;
  };
};

export const PlusCheckoutContainer = ({
  checkoutRef,
  className,
}: PlusCheckoutContainerProps): ReactElement => {
  const { giftToUser } = useGiftUserContext();
  const { isPlusAvailable } = usePaymentContext();
  const { isPlus } = usePlusSubscription();

  const getContainerElement = () => {
    if (!isPlusAvailable) {
      return PlusUnavailable;
    }

    if (giftToUser) {
      return null;
    }

    if (isPlus) {
      return PlusPlus;
    }

    return null;
  };

  const ContainerElement = getContainerElement();
  const shouldRenderCheckout = !ContainerElement;

  return (
    <div
      ref={shouldRenderCheckout ? checkoutRef : undefined}
      className={classNames(
        shouldRenderCheckout && 'checkout-container',
        className?.container,
      )}
    >
      {ContainerElement && <ContainerElement className={className?.element} />}
    </div>
  );
};
