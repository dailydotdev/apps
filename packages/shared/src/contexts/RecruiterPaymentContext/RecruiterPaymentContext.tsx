import type { ReactElement } from 'react';
import React from 'react';
import type { RecruiterContextProviderProps } from './types';
import { RecruiterPaymentPaddleContextProvider } from './RecruiterPaymentPaddleContext';
import { RecruiterPaymentPublicContextProvider } from './RecruiterPaymentPublicContext';
import { useAuthContext } from '../AuthContext';

export const RecruiterPaymentContext = ({
  children,
  ...props
}: RecruiterContextProviderProps): ReactElement => {
  const { user, isLoggedIn } = useAuthContext();

  if (!user || !isLoggedIn) {
    return (
      <RecruiterPaymentPublicContextProvider
        onPaymentComplete={props.onCompletion}
      >
        {children}
      </RecruiterPaymentPublicContextProvider>
    );
  }

  return (
    <RecruiterPaymentPaddleContextProvider {...props}>
      {children}
    </RecruiterPaymentPaddleContextProvider>
  );
};
