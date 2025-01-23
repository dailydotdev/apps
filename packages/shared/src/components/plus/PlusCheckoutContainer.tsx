import type { ReactElement } from 'react';
import React from 'react';

import { usePaymentContext } from '../../contexts/PaymentContext';
import { usePlusSubscription } from '../../hooks';
import { PlusUnavailable } from './PlusUnavailable';
import { PlusPlus } from './PlusPlus';

export type PlusCheckoutContainerProps = {
  className?: string;
};

export const PlusCheckoutContainer = ({
  className,
}: PlusCheckoutContainerProps): ReactElement => {
  const { isPlusAvailable } = usePaymentContext();
  const { isPlus } = usePlusSubscription();

  if (!isPlusAvailable) {
    return <PlusUnavailable className={className} />;
  }

  if (isPlus) {
    return <PlusPlus className={className} />;
  }

  return null;
};
