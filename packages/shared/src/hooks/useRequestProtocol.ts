import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  gqlRequest,
  REQUEST_PROTOCOL_KEY,
  RequestProtocol,
} from '../graphql/common';

export const useRequestProtocol = (): RequestProtocol => {
  const client = useQueryClient();
  const { requestMethod, fetchMethod, isCompanion } =
    client.getQueryData<RequestProtocol>(REQUEST_PROTOCOL_KEY) || {};

  return useMemo(
    () => ({
      requestMethod: requestMethod || gqlRequest,
      fetchMethod: fetchMethod || fetch,
      isCompanion,
    }),
    [requestMethod, fetchMethod, isCompanion],
  );
};
