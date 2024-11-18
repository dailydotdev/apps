import React, { ReactElement, ReactNode, useEffect } from 'react';
import { cloudinaryPlusBackground } from '@dailydotdev/shared/src/lib/image';
import { PaymentContextProvider } from '@dailydotdev/shared/src/contexts/PaymentContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { MainFeedPageProps } from '../MainFeedPage';
import { PlusHeader } from './PlusHeader';

export default function PlusLayout({
  children,
}: MainFeedPageProps): ReactElement {
  const { isLoggedIn, showLogin } = useAuthContext();

  useEffect(() => {
    if (isLoggedIn) {
      return;
    }

    showLogin({ trigger: AuthTriggers.Plus });
  }, [isLoggedIn, showLogin]);

  return (
    <main className="relative flex h-screen flex-col">
      <img
        src={cloudinaryPlusBackground}
        alt="Plus background"
        className="absolute inset-0 -z-1 h-full w-full object-cover"
        aria-hidden
      />
      <PlusHeader />
      {children}
    </main>
  );
}

export function getPlusLayout(page: ReactNode): ReactNode {
  return (
    <PaymentContextProvider>
      <PlusLayout>{page}</PlusLayout>
    </PaymentContextProvider>
  );
}
