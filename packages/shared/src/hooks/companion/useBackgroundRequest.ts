import { QueryKey, useQueryClient } from '@tanstack/react-query';
import { isQueryKeySame } from '../../graphql/common';
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
    const validKey = Array.isArray(key) ? key : [key];
    if (!enabled || !isQueryKeySame(validKey, queryKey)) {
      return;
    }

    if (callback) {
      callback({ key: validKey, ...args });
    } else {
      client.setQueryData(queryKey, args.res);
    }
  });
};
