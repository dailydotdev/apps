import { ClientTest } from './client/client';
import { setAppBootData } from '../app-boot';
import { HydrationBoundary } from '@tanstack/react-query';
import { cookies } from 'next/headers';

export default async function Page() {
  const allCookies = (await cookies()).toString();
  const { state, boot } = await setAppBootData({ cookies: allCookies });
  return (
    <HydrationBoundary state={state}>
      <h1 className="text-xl font-bold mb-4">Hello world funnel</h1>
      <p>
        <strong>Server</strong> says user is {boot?.user?.id ?? 'not logged'} -{' '}
        {boot?.user?.email ?? 'no email'}
      </p>
      <ClientTest />
    </HydrationBoundary>
  );
}
