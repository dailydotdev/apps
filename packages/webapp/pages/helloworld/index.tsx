import type { ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import type { DehydratedState } from '@tanstack/react-query';
import React from 'react';
import Head from 'next/head';
import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from '@tanstack/react-query';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import {
  FUNNEL_BOOT_QUERY_KEY,
  useFunnelBoot,
} from '@dailydotdev/shared/src/features/onboarding/hooks/useFunnelBoot';
import type { FunnelBootData } from '@dailydotdev/shared/src/features/onboarding/types/funnelBoot';

import { getFunnelBootData } from '@dailydotdev/shared/src/features/onboarding/funnelBoot';
import { FunnelStepper } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepper';
import {
  useAuthContext,
  checkIfGdprCovered,
} from '@dailydotdev/shared/src/contexts/AuthContext';
import { useRouter } from 'next/router';
import { Provider as JotaiProvider } from 'jotai/react';
import { GdprConsentKey } from '@dailydotdev/shared/src/hooks/useCookieBanner';

type PageProps = {
  boot: FunnelBootData;
  id?: string;
  version?: string;
  dehydratedState: DehydratedState;
  showCookieBanner?: boolean;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  query,
  req,
  res,
}) => {
  const { id, version } = query;
  const allCookies = req.headers.cookie || '';

  // Get the boot data
  const boot = await getFunnelBootData({
    app: BootApp.Webapp,
    cookies: allCookies,
    id: id as string,
    version: version as string,
  });

  // Handle any cookies from the response
  const setCookieHeader = boot.response.headers.get('set-cookie');
  if (setCookieHeader) {
    res.setHeader('Set-Cookie', setCookieHeader);
  }

  // Prefetch the boot data
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: FUNNEL_BOOT_QUERY_KEY,
    queryFn: () => boot.data,
  });

  // Check if the user already accepted cookies
  const isGdprCovered = checkIfGdprCovered(boot?.data?.geo);
  const hasAcceptedCookies = allCookies.includes(GdprConsentKey.Marketing);

  // Return props including the dehydrated state
  return {
    props: {
      boot: boot.data,
      id: (id as string) || null,
      version: (version as string) || null,
      dehydratedState: dehydrate(queryClient),
      showCookieBanner: isGdprCovered && !hasAcceptedCookies,
    },
  };
};

export default function HelloWorldPage({
  dehydratedState,
  showCookieBanner,
}: PageProps): ReactElement {
  const { data: funnelBoot } = useFunnelBoot();
  const { funnel, session } = funnelBoot?.funnelState ?? {};
  const { isAuthReady, isValidRegion, user } = useAuthContext();
  const router = useRouter();

  if (isAuthReady && !isValidRegion) {
    router.replace('/onboarding');
    return null;
  }

  if (isAuthReady && user?.isPlus) {
    router.replace('/');
    return null;
  }

  return (
    <HydrationBoundary state={dehydratedState}>
      <JotaiProvider>
        <Head>
          <meta name="robots" content="noindex" />
        </Head>

        {!!funnel && !!session.id && (
          <FunnelStepper
            funnel={funnel}
            session={session}
            showCookieBanner={showCookieBanner}
            onComplete={() => router.replace('/onboarding')}
          />
        )}
      </JotaiProvider>
    </HydrationBoundary>
  );
}
