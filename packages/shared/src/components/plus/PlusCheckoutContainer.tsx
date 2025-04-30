import type { MouseEventHandler, ReactElement } from 'react';
import React, { useMemo } from 'react';

import classNames from 'classnames';
import { usePaymentContext } from '../../contexts/payment/context';
import { usePlusSubscription } from '../../hooks';
import { PlusUnavailable } from './PlusUnavailable';
import { PlusPlus } from './PlusPlus';
import { useGiftUserContext } from './GiftUserContext';
import { Checkbox } from '../fields/Checkbox';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';

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
  const { logEvent } = useLogContext();
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

  const handleHover: MouseEventHandler = (e) => {
    logEvent({ event_name: LogEvent.HoverCheckoutWidget });
  };

  return (
    <div className={className?.container}>
      <div
        onMouseEnter={handleHover}
        ref={shouldRenderCheckout ? checkoutRef : undefined}
        className={classNames(shouldRenderCheckout && 'checkout-container')}
      />
      {ContainerElement && <ContainerElement className={className?.element} />}
      {showTrialCheckbox && (
        <div className="mx-auto mt-4 max-w-[40rem]">
          <Checkbox name="freeTrialReminder" defaultChecked>
            Remind me before the trial ends
          </Checkbox>
        </div>
      )}
    </div>
  );
};
