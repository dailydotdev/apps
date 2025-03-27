import { cookies } from 'next/headers';
import { HydrationBoundary } from '@tanstack/react-query';
import { getAppBootData } from '../app-boot';
import { ClientTest } from './client/client';

async function getIdAndVersion({
  params,
  searchParams,
}): Promise<Partial<Record<'id' | 'version', string>>> {
  const { id } = await params;
  const { version } = await searchParams;

  return { id, version };
}

export default async function Page(props) {
  const allCookies = (await cookies()).toString();
  const { state, boot } = await getAppBootData({ cookies: allCookies });
  const { id, version } = await getIdAndVersion(props);

  console.log('Id & Version:', { id, version });

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
