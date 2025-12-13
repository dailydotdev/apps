import type { ReactElement } from 'react';
import React from 'react';
import type { RecruiterContextProviderProps } from './types';
import { RecruiterPaymentPaddleContextProvider } from './RecruiterPaymentPaddleContext';

export const RecruiterPaymentContext = ({
  children,
  ...props
}: RecruiterContextProviderProps): ReactElement => {
  return (
    <RecruiterPaymentPaddleContextProvider {...props}>
      {children}
    </RecruiterPaymentPaddleContextProvider>
  );
};
