import { QueryKey, QueryClient, useQueryClient } from 'react-query';
import { isQueryKeySame } from '@dailydotdev/shared/src/graphql/common';
import { useRawBackgroundRequest } from './useRawBackgroundRequest';

interface UseBackgroundRequestOptionalProps {
  queryClient?: QueryClient;
  callback?: (params: unknown) => void;
  enabled?: boolean;
}

export const useBackgroundRequest = (
  queryKey: QueryKey,
  {
    callback,
    queryClient,
    enabled = true,
  }: UseBackgroundRequestOptionalProps = {},
): void => {
  // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const client = queryClient || useQueryClient();
  useRawBackgroundRequest(({ key, ...args }) => {
    if (!enabled || !isQueryKeySame(key, queryKey)) {
      return;
    }

    if (callback) {
      callback({ key, ...args });
    } else {
      client.setQueryData(queryKey, args.res);
    }
  });
};
