import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../AuthContext';
import { usePixelsContext } from '../PixelsContext';
import { useToastNotification } from '../../hooks';
import { PaymentProviderFactory } from './PaymentProviderFactory';
import type { PaymentContextData, PaymentContextProviderProps } from './types';
import { PaymentContext } from './context';

export const PaymentContextProvider = ({
  children,
}: PaymentContextProviderProps): ReactElement => {
  const router = useRouter();
  const { user, isValidRegion: isPlusAvailable } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { trackPayment } = usePixelsContext();
  const [provider] = useState(() =>
    PaymentProviderFactory.createProvider(
      router,
      displayToast,
      user?.subscriptionFlags?.appAccountToken,
    ),
  );

  useEffect(() => {
    provider.initialize();
    return () => {
      provider.cleanup?.();
    };
  }, [provider]);

  const openCheckout = useCallback(
    ({ priceId, giftToUserId }: { priceId: string; giftToUserId?: string }) => {
      if (!isPlusAvailable) return;
      provider.openCheckout({ priceId, giftToUserId });
    },
    [isPlusAvailable, provider],
  );

  const contextData = useMemo<PaymentContextData>(
    () => ({
      openCheckout,
      isPlusAvailable,
      isPricesPending: false,
      isFreeTrialExperiment: false,
    }),
    [isPlusAvailable, openCheckout],
  );

  return (
    <PaymentContext.Provider value={contextData}>
      {children}
    </PaymentContext.Provider>
  );
}; 