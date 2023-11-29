import { QueryKey, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { useBackgroundRequest } from '@dailydotdev/shared/src/hooks/companion';

export const useBackgroundPaginatedRequest = <T extends InfiniteData<unknown>>(
  queryKey: QueryKey,
): T => {
  const client = useQueryClient();
  const data = client.getQueryData<T>(queryKey);
  useBackgroundRequest(queryKey, {
    callback: ({ res, req }) => {
      if (!res) {
        return;
      }

      const current = client.getQueryData(queryKey) as T;
      const updated = { ...current } as T;
      const index = updated.pages.length - 1;
      updated.pageParams[index] = req.variables.after;
      updated.pages[index] = res;
      client.setQueryData(queryKey, updated);
    },
  });

  return data;
};
