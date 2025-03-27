import {
  appBootDataQuery,
  BootApp,
  getBootData,
} from '@dailydotdev/shared/src/lib/boot';
import { dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@dailydotdev/shared/src/graphql/queryClient';

export const getAppBootData = async ({
  cookies,
}: Record<'cookies', string>) => {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    ...appBootDataQuery,
    queryFn: async () =>
      await getBootData(BootApp.Webapp, undefined, { cookies }),
  });
  const state = dehydrate(queryClient, { shouldDehydrateQuery: () => true }); // to also include Errors

  return {
    state,
    queryClient,
    boot: queryClient.getQueryData(appBootDataQuery.queryKey),
  };
};
