import { QueryKey, useQueryClient, InfiniteData } from 'react-query';
import { isQueryKeySame } from '@dailydotdev/shared/src/graphql/common';
import { useBackgroundRequest } from './useBackgroundRequest';

export const useBackgroundPaginatedRequest = <T extends InfiniteData<unknown>>(
  queryKey: QueryKey,
): void => {
  const client = useQueryClient();
  useBackgroundRequest(queryKey, ({ queryKey: key, res, req }) => {
    if (!key) {
      return;
    }

    if (!isQueryKeySame(key, queryKey)) {
      return;
    }

    const current = client.getQueryData(queryKey) as T;
    const updated = { ...current } as T;
    const index = updated.pages.length - 1;
    updated.pages[index] = res;
    updated.pageParams[index] = req.variables.pageParams;

    client.setQueryData(queryKey, updated);
  });
};
