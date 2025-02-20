import type { ReactElement } from 'react';
import React, { useMemo } from 'react';

import classNames from 'classnames';
import { usePaymentContext } from '../../contexts/PaymentContext';
import { usePlusSubscription } from '../../hooks';
import { PlusUnavailable } from './PlusUnavailable';
import { PlusPlus } from './PlusPlus';
import { useGiftUserContext } from './GiftUserContext';
import { Checkbox } from '../fields/Checkbox';

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
  const { isPlusAvailable, isFreeTrialExperiment, isPricesPending } =
    usePaymentContext();
  const { isPlus } = usePlusSubscription();
  const ContainerElement = useMemo(() => {
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
  }, [isPlusAvailable, giftToUser, isPlus]);
  const shouldRenderCheckout = !ContainerElement;
  const showTrialCheckbox =
    isFreeTrialExperiment &&
    !giftToUser &&
    !isPricesPending &&
    shouldRenderCheckout;

  return (
    <div className={className?.container}>
      <div
        ref={shouldRenderCheckout ? checkoutRef : undefined}
        className={classNames(shouldRenderCheckout && 'checkout-container')}
      />
      {ContainerElement && <ContainerElement className={className?.element} />}
      {showTrialCheckbox && (
        <Checkbox name="freeTrialReminder" checked className="mt-4">
          Remind me before the trial ends
        </Checkbox>
      )}
    </div>
  );
};
