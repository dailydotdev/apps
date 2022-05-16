import { QueryKey, useQueryClient } from 'react-query';
import { isQueryKeySame } from '@dailydotdev/shared/src/graphql/common';
import { useRawBackgroundRequest } from './useRawBackgroundRequest';

export const useBackgroundRequest = (
  queryKey: QueryKey,
  command?: (params: unknown) => void,
): void => {
  const client = useQueryClient();
  useRawBackgroundRequest(({ key, ...args }) => {
    if (!isQueryKeySame(key, queryKey)) {
      return;
    }

    if (command) {
      command({ key, ...args });
    } else {
      client.setQueryData(queryKey, args.res);
    }
  });
};
