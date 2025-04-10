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

type PageProps = {
  boot: FunnelBootData;
  id?: string;
  version?: string;
  dehydratedState: DehydratedState;
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
    id: `${id}` || 'first-funnel',
    version: version as string,
  });
  console.log({ boot });

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

  // Return props including the dehydrated state
  return {
    props: {
      boot: boot.data,
      id: (id as string) || null,
      version: (version as string) || null,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default function HelloWorldPage({
  boot,
  dehydratedState,
}: PageProps): ReactElement {
  // const { user, dispatch } = useAppAuth();
  const { data: funnelBoot } = useFunnelBoot();
  const { funnel, session } = funnelBoot?.funnelState ?? {};

  console.log({ funnel, session });

  return (
    <HydrationBoundary state={dehydratedState}>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>

      {!!funnel && !!session.id && (
        <FunnelStepper funnel={funnel} session={session} />
      )}
    </HydrationBoundary>
  );
}
