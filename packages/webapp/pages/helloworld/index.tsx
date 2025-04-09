import type { FC, ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import type { DehydratedState } from '@tanstack/react-query';
import React from 'react';
import Head from 'next/head';
import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from '@tanstack/react-query';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import {
  FUNNEL_BOOT_QUERY_KEY,
  useFunnelBoot,
} from '@dailydotdev/shared/src/features/onboarding/hooks/useFunnelBoot';
import type {
  FunnelBootData,
  FunnelBootResponse,
} from '@dailydotdev/shared/src/features/onboarding/types/funnelBoot';
import {
  AppAuthActionsKeys,
  useAppAuth,
} from '@dailydotdev/shared/src/features/common/hooks/useAppAuth';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';

async function getFunnelBootData({
  app,
  cookies,
  id,
  version,
}: {
  app: string;
  cookies: string;
  id?: string;
  version?: string;
}): Promise<FunnelBootResponse> {
  const params = new URLSearchParams();
  if (id) {
    params.append('id', id);
  }
  if (version) {
    params.append('v', version);
  }

  const paramString = params.toString();
  const url = `${apiUrl}/boot/funnel${paramString ? `?${paramString}` : ''}`;

  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      app,
      'Content-Type': 'application/json',
      ...(cookies && { Cookie: cookies }),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch funnel boot data: ${res.status}`);
  }

  const data = await res.json();

  return {
    data,
    response: res,
  };
}

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

const ClientTest: FC = () => {
  const { user, dispatch } = useAppAuth();
  const { data: funnelBoot } = useFunnelBoot();
  const currentStep = funnelBoot?.funnelState?.session?.currentStep;

  return (
    <div className="border-gray-200 rounded-lg mt-6 border p-4">
      <h2 className="mb-2 text-lg font-bold">Client Component</h2>
      <p>
        <strong>Client</strong> says user is {user?.id ?? 'not logged'}
      </p>

      {funnelBoot?.funnelState && (
        <div className="my-2">
          <p>
            <strong>Current step (client):</strong> {currentStep || 'None'}
          </p>
          <p>
            <strong>Session ID (client):</strong>{' '}
            {funnelBoot.funnelState.session.id}
          </p>
        </div>
      )}

      <div className="mt-2 flex gap-2">
        <Button
          type="button"
          onClick={() => dispatch({ type: AppAuthActionsKeys.REFRESH })}
        >
          Refetch user
        </Button>
        <Button
          type="button"
          onClick={() => dispatch({ type: AppAuthActionsKeys.LOGOUT })}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default function HelloWorldPage({
  boot,
  dehydratedState,
}: PageProps): ReactElement {
  return (
    <HydrationBoundary state={dehydratedState}>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>

      <h1 className="mb-4 text-xl font-bold">Hello world funnel</h1>
      <p>
        <strong>Server</strong> says user is {boot?.user?.id ?? 'not logged'} -{' '}
        {boot?.user?.email ?? 'no email'}
      </p>
      {boot.funnelState && (
        <div>
          <p>
            <strong>Current step:</strong>{' '}
            {boot.funnelState.session.currentStep || 'None'}
          </p>
          <p>
            <strong>Funnel ID:</strong> {boot.funnelState.funnel.id}
          </p>
          <p>
            <strong>Funnel Version:</strong> {boot.funnelState.funnel.version}
          </p>
          <p>
            <strong>Session ID:</strong> {boot.funnelState.session.id}
          </p>
        </div>
      )}
      <ClientTest />
    </HydrationBoundary>
  );
}
