import type { AppPageProps } from '@dailydotdev/shared/src/features/common/types/page';
import type { ReactElement } from 'react';
import React from 'react';
import { cookies } from 'next/headers';
import { HydrationBoundary } from '@tanstack/react-query';
import Head from 'next/head';
import { ClientTest } from './client/client';
import { funnelBootData } from '../actions';

async function getIdAndVersion({
  params,
  searchParams,
}): Promise<Partial<Record<'id' | 'version', string>>> {
  const { id } = await params;
  const { version } = await searchParams;

  return { id, version };
}

export default async function Page(props: AppPageProps): Promise<ReactElement> {
  const cookieStore = cookies();
  const allCookies = cookieStore.toString();
  const { id, version } = await getIdAndVersion(props);

  // Get the response from getFunnelBootData to access cookies
  const boot = await funnelBootData(id, version, allCookies);

  // Create a dehydrated state for React Query
  const state = {
    queries: [
      {
        queryKey: ['funnelBoot'],
        queryHash: 'funnelBoot',
        state: {
          data: boot,
          dataUpdateCount: 1,
          dataUpdatedAt: Date.now(),
          error: null,
          errorUpdateCount: 0,
          errorUpdatedAt: 0,
          fetchFailureCount: 0,
          fetchMeta: null,
          isFetching: false,
          isInvalidated: false,
          isPaused: false,
          status: 'success',
        },
      },
    ],
  };

  return (
    <HydrationBoundary state={state}>
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
      {/* <ClientTest /> */}
    </HydrationBoundary>
  );
}
