import type { Boot } from '@dailydotdev/shared/src/lib/boot';
import type { DehydratedState } from '@tanstack/react-query';
import {
  appBootDataQuery,
  getBootData,
  BootApp,
} from '@dailydotdev/shared/src/lib/boot';
import { dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@dailydotdev/shared/src/graphql/queryClient';

interface GetAppBootDataProps {
  cookies: string;
}

interface GetAppBootDataReturn {
  state: DehydratedState;
  queryClient: ReturnType<typeof getQueryClient>;
  boot: Boot;
}

export const getAppBootData = async ({
  cookies,
}: GetAppBootDataProps): Promise<GetAppBootDataReturn> => {
  const queryClient = getQueryClient();
  const boot = await queryClient.fetchQuery({
    ...appBootDataQuery,
    queryFn: () => getBootData(BootApp.Webapp, undefined, { cookies }),
  });
  const state = dehydrate(queryClient, { shouldDehydrateQuery: () => true }); // to also include Errors

  if (!boot) {
    throw new Error('Failed to fetch boot data');
  }

  return {
    state,
    queryClient,
    boot,
  };
};
