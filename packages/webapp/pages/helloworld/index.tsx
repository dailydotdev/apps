import type { ReactElement } from 'react';
import React, { useEffect, useCallback } from 'react';
import type { GetServerSideProps } from 'next';
import type { DehydratedState } from '@tanstack/react-query';
import Head from 'next/head';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import {
  FUNNEL_BOOT_QUERY_KEY,
  useFunnelBoot,
} from '@dailydotdev/shared/src/features/onboarding/hooks/useFunnelBoot';

import { getFunnelBootData } from '@dailydotdev/shared/src/features/onboarding/funnelBoot';
import { FunnelStepper } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepper';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useRouter } from 'next/router';
import { Provider as JotaiProvider } from 'jotai/react';
import { GdprConsentKey } from '@dailydotdev/shared/src/hooks/useCookieBanner';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import {
  getCookiesAndHeadersFromRequest,
  setResponseHeaderFromBoot,
} from '@dailydotdev/shared/src/features/onboarding/lib/utils';

type PageProps = {
  dehydratedState: DehydratedState;
  initialStepId: string | null;
  showCookieBanner?: boolean;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  query,
  req,
  res,
}) => {
  const { id, v: version } = query;
  const { cookies, forwardedHeaders } = getCookiesAndHeadersFromRequest(req);

  // Get the boot data
  const boot = await getFunnelBootData({
    app: BootApp.Webapp,
    cookies,
    id: id as string,
    version: version as string,
    forwardedHeaders,
  });

  // Handle any cookies from the response
  setResponseHeaderFromBoot(boot, res);

  // Prefetch the boot data
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: FUNNEL_BOOT_QUERY_KEY,
    queryFn: () => boot.data,
  });

  // Check if the user already accepted cookies
  const hasAcceptedCookies = cookies.includes(GdprConsentKey.Marketing);

  // Determine the initial step ID
  const queryStepId = query?.stepId as string | undefined;
  const initialStepId: string | null =
    queryStepId ?? boot.data?.funnelState?.session?.currentStep;

  // Return props including the dehydrated state
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      showCookieBanner: !hasAcceptedCookies,
      initialStepId,
    },
  };
};

export default function HelloWorldPage({
  dehydratedState,
  initialStepId,
  showCookieBanner,
}: PageProps): ReactElement {
  const { data: funnelBoot } = useFunnelBoot();
  const { funnel, session } = funnelBoot?.funnelState ?? {};
  const { isAuthReady, isValidRegion, user } = useAuthContext();
  const router = useRouter();
  const { setTheme, themeMode } = useSettingsContext();

  useEffect(() => {
    const funnelTheme = funnel?.parameters?.theme?.mode;
    if (funnelTheme && funnelTheme !== themeMode) {
      setTheme(funnelTheme);
    }
  }, [funnel?.parameters?.theme?.mode, setTheme, themeMode]);

  const onComplete = useCallback(() => {
    router.replace(funnel?.redirectOnFinish || '/onboarding');
  }, [router, funnel?.redirectOnFinish]);

  if (isAuthReady && !isValidRegion) {
    router.replace('/onboarding');
    return null;
  }

  if (isAuthReady && user?.isPlus && !router?.query?.subscribed) {
    router.replace('/');
    return null;
  }

  return (
    <HydrationBoundary state={dehydratedState}>
      {/* <HotJarTracking hotjarId="6381877" /> */}
      <JotaiProvider>
        <Head>
          <meta name="robots" content="noindex" />
        </Head>

        {!!funnel && !!session.id && (
          <FunnelStepper
            funnel={funnel}
            initialStepId={initialStepId}
            session={session}
            showCookieBanner={showCookieBanner}
            onComplete={onComplete}
          />
        )}
        <Toast autoDismissNotifications />
      </JotaiProvider>
    </HydrationBoundary>
  );
}
