import type { AppPageProps } from '@dailydotdev/shared/src/features/common/types/page';
import type { ReactElement } from 'react';
import React from 'react';
import { cookies } from 'next/headers';
import { HydrationBoundary } from '@tanstack/react-query';
import Head from 'next/head';
import { Provider } from 'jotai/react';
import { getAppBootData } from '../appBoot';
import { ClientTest } from './client/client';

async function getIdAndVersion({
  params,
  searchParams,
}): Promise<Partial<Record<'id' | 'version', string>>> {
  const { id } = await params;
  const { version } = await searchParams;

  return { id, version };
}

export default async function Page(props: AppPageProps): Promise<ReactElement> {
  const allCookies = (await cookies()).toString();
  const { state, boot } = await getAppBootData({
    cookies: allCookies,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, version } = await getIdAndVersion(props);

  return (
    <HydrationBoundary state={state}>
      <Provider>
        <Head>
          <meta name="robots" content="noindex" />
        </Head>

        <h1 className="mb-4 text-xl font-bold">Hello world funnel</h1>
        <p>
          <strong>Server</strong> says user is {boot?.user?.id ?? 'not logged'}{' '}
          - {boot?.user?.email ?? 'no email'}
        </p>
        <ClientTest />
      </Provider>
    </HydrationBoundary>
  );
}
