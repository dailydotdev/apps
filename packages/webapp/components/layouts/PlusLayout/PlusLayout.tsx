import React, { ReactElement, ReactNode, useEffect } from 'react';
import { cloudinaryPlusBackground } from '@dailydotdev/shared/src/lib/image';
import { PaymentContextProvider } from '@dailydotdev/shared/src/contexts/PaymentContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { onboardingUrl } from '@dailydotdev/shared/src/lib/constants';
import { useRouter } from 'next/router';
import { useGrowthBookContext } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { Pixels } from '@dailydotdev/shared/src/components/Pixels';
import { MainFeedPageProps } from '../MainFeedPage';
import { PlusHeader } from './PlusHeader';

export default function PlusLayout({
  children,
}: MainFeedPageProps): ReactElement {
  const { user, isAuthReady } = useAuthContext();
  const { growthbook } = useGrowthBookContext();
  const router = useRouter();

  const isPageReady = growthbook?.ready && router?.isReady && isAuthReady;

  const shouldRedirectOnboarding = !user && isPageReady;

  useEffect(() => {
    if (!shouldRedirectOnboarding) {
      return;
    }

    router.push(`${onboardingUrl}`);
  }, [router, shouldRedirectOnboarding]);

  if (!isPageReady || shouldRedirectOnboarding) {
    return null;
  }

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
      <Pixels hotjarId="5215055" />
      <PlusLayout>{page}</PlusLayout>
    </PaymentContextProvider>
  );
}
