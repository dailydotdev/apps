import { appBootDataQuery } from '@dailydotdev/shared/src/lib/boot';
import { ClientTest } from './client/client';
import { getQueryClient } from '@dailydotdev/shared/src/graphql/queryClient';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function Page() {
  const queryClient = getQueryClient();
  // get boot data
  await queryClient.prefetchQuery(appBootDataQuery);
  const state = dehydrate(queryClient, { shouldDehydrateQuery: () => true }); // to also include Errors

  const user = queryClient.getQueryData(appBootDataQuery.queryKey)?.user;

  return (
    <HydrationBoundary state={state}>
      <h1 className="text-xl font-bold mb-4">Hello world funnel</h1>
      <p><strong>Server</strong>  says user is {user?.id ?? 'not logged'}</p>
      <ClientTest />
    </HydrationBoundary>
  );
}
