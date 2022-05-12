import { QueryKey } from 'react-query';
import { isQueryKeySame } from '@dailydotdev/shared/src/graphql/common';
import { useRawBackgroundRequest } from './useRawBackgroundRequest';

export const useBackgroundRequest = (
  queryKey: QueryKey,
  command: (params: unknown) => void,
): void => {
  useRawBackgroundRequest(({ queryKey: key, ...args }) => {
    if (!isQueryKeySame(key, queryKey)) {
      return;
    }

    command({ queryKey: key, ...args });
  });
};
