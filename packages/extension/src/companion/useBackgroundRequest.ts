import { QueryKey, useQueryClient } from 'react-query';
import { isQueryKeySame } from '@dailydotdev/shared/src/graphql/common';
import { useRawBackgroundRequest } from './useRawBackgroundRequest';

interface UseBackgroundRequestOptionalProps {
  callback?: (params: unknown) => void;
  enabled?: boolean;
}

export const useBackgroundRequest = (
  queryKey: QueryKey,
  { callback, enabled = true }: UseBackgroundRequestOptionalProps = {},
): void => {
  const client = useQueryClient();
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
