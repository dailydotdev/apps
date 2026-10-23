import type { PropsWithChildren, ReactElement, ReactNode } from 'react';
import React, { useEffect } from 'react';
import { cloudinaryPlusBackground } from '@dailydotdev/shared/src/lib/image';
import { PaymentContextProvider } from '@dailydotdev/shared/src/contexts/payment';
import { usePlusSale } from '@dailydotdev/shared/src/hooks/usePlusSale';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { onboardingUrl } from '@dailydotdev/shared/src/lib/constants';
import { useRouter } from 'next/router';
import { useGrowthBookContext } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import {
  ThemeMode,
  useSettingsContext,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import { usePlusCheckoutV2 } from '@dailydotdev/shared/src/components/plus/checkout/usePlusCheckoutV2';
import type { MainFeedPageProps } from '../MainFeedPage';
import { PlusHeader } from './PlusHeader';

export default function PlusLayout({
  children,
}: MainFeedPageProps): ReactElement | null {
  const { user, isAuthReady } = useAuthContext();
  const { growthbook } = useGrowthBookContext();
  const router = useRouter();
  const { applyThemeMode } = useSettingsContext();

  // The new checkout keeps signed-out visitors on the page (sign-in replaces
  // the payment form); today's page sends them to onboarding.
  const { isV2: isV2Arm, isLoading: isV2Loading } = usePlusCheckoutV2();
  // /plus/payment stays as is: the extension still links to it.
  const isV2 =
    isV2Arm &&
    ['/plus', '/plus/gift', '/plus/success'].includes(router.pathname);
  const isPageReady =
    growthbook?.ready && router?.isReady && isAuthReady && !isV2Loading;

  const shouldRedirectOnboarding = !user && isPageReady && !isV2;

  useEffect(() => {
    if (!shouldRedirectOnboarding) {
      return;
    }

    router.push(`${onboardingUrl}`);
  }, [router, shouldRedirectOnboarding]);

  useEffect(() => {
    applyThemeMode(ThemeMode.Dark);
    return () => {
      applyThemeMode();
    };
  }, [applyThemeMode]);

  if (!isPageReady || shouldRedirectOnboarding) {
    return null;
  }

  if (isV2) {
    // Draws its own back button, logo and background.
    return <main className="relative flex min-h-dvh flex-col">{children}</main>;
  }

  return (
    <main className="relative flex min-h-dvh flex-col">
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

// The sale reaches Paddle only through the Plus routes; the onboarding funnel
// mounts its own provider and must stay free of promos.
function PlusSalePaymentProvider({
  children,
}: PropsWithChildren): ReactElement {
  const { discountId } = usePlusSale();

  return (
    <PaymentContextProvider discountId={discountId}>
      {children}
    </PaymentContextProvider>
  );
}

export function getPlusLayout(page: ReactNode): ReactNode {
  return (
    <PlusSalePaymentProvider>
      <PlusLayout>{page}</PlusLayout>
    </PlusSalePaymentProvider>
  );
}
